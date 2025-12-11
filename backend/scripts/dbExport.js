// Gerekli paketleri yükle:
// npm install mongodb mssql

const { MongoClient } = require("mongodb");
const sql = require("mssql");

// MongoDB bağlantısı
const mongoUri = "mongodb://localhost:27017";
const mongoDbName = "userDB";

// MSSQL bağlantısı
const sqlConfig = {
  user: "sa",
  password: "Fh145236!",
  server: "HANTSOFT\\HANTSOFT", // senin instance adın
  database: "AKSA_DB",
  options: {
    trustServerCertificate: true
  }
};

// Mongo tiplerini MSSQL tipine eşleştirme
function mapMongoFieldToSql(fieldName, value, isPrimaryKey = false) {
  if (isPrimaryKey && fieldName === "_id" && value && value._bsontype === "ObjectId") {
    return "[Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID()";
  }
  if (value && value._bsontype === "ObjectId") {
    return `[${fieldName}] UNIQUEIDENTIFIER`;
  }
  if (typeof value === "string") return `[${fieldName}] NVARCHAR(MAX)`;
  if (typeof value === "boolean") return `[${fieldName}] BIT`;
  if (typeof value === "number") return Number.isInteger(value) ? `[${fieldName}] INT` : `[${fieldName}] FLOAT`;
  if (value instanceof Date) return `[${fieldName}] DATETIME2`;
  return `[${fieldName}] NVARCHAR(MAX)`; // fallback
}

// Foreign key constraint ekleme
async function addForeignKeyConstraint(tableName, columnName, referencedTable, referencedColumn = "Id") {
  const fkName = `FK_${tableName}_${referencedTable}`;
  const sqlQuery = `
    IF NOT EXISTS (
      SELECT * FROM sys.foreign_keys WHERE name = '${fkName}'
    )
    ALTER TABLE ${tableName}
    ADD CONSTRAINT ${fkName}
    FOREIGN KEY (${columnName}) REFERENCES ${referencedTable}(${referencedColumn});
  `;
  await sql.query(sqlQuery);
}

async function migrateAllCollections() {
  try {
    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const db = mongoClient.db(mongoDbName);

    const collections = await db.listCollections().toArray();
    await sql.connect(sqlConfig);

    for (const coll of collections) {
      const collName = coll.name;
      console.log(`Migrating collection: ${collName}`);

      const documents = await db.collection(collName).find({}).toArray();
      if (documents.length === 0) continue;

      const sampleDoc = documents[0];
      const columns = Object.keys(sampleDoc);

      // Tablo oluşturma SQL
      let createTableSql = `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='${collName}' AND xtype='U') CREATE TABLE ${collName} (`;
      createTableSql += columns.map(col => {
        const isPrimaryKey = col === "_id";
        return mapMongoFieldToSql(col, sampleDoc[col], isPrimaryKey);
      }).join(", ");
      createTableSql += ")";

      await sql.query(createTableSql);

      // Foreign key ilişkilerini kurma (örnek: userId -> Users.Id)
      for (const col of columns) {
        if (col.toLowerCase().endsWith("id") && col !== "_id") {
          const referencedTable = col.replace("Id", "");
          await addForeignKeyConstraint(collName, col, referencedTable);
        }
      }

      // Insert işlemi
      for (const doc of documents) {
        const keys = Object.keys(doc);
        const values = keys.map(k => doc[k]);

        const insertSql = `INSERT INTO ${collName} (${keys.map(k => k === "_id" ? "[Id]" : `[${k}]`).join(", ")})
                           VALUES (${keys.map((_, i) => `@param${i}`).join(", ")})`;

        const request = new sql.Request();
        keys.forEach((k, i) => {
          let val = values[i];
          if (val instanceof Date) val = val.toISOString();
          if (val && val._bsontype === "ObjectId") val = val.toString();
          if (typeof val === "object" && !Array.isArray(val)) val = JSON.stringify(val);
          request.input(`param${i}`, val);
        });

        await request.query(insertSql);
      }

      console.log(`Collection ${collName} migrated successfully!`);
    }

    await mongoClient.close();
    await sql.close();
    console.log("Migration completed for all collections!");
  } catch (err) {
    console.error("Migration error:", err);
  }
}

migrateAllCollections();
