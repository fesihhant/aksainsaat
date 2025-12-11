import React from "react";
import { DataGrid } from '@mui/x-data-grid';

const CDataGrid = ({filteredData, columns, row, loading, pageSize}) => { 
    return (
        <DataGrid
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row._id}
            loading={loading}
            autoHeight
            disableSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
                pagination: {
                    paginationModel: { pageSize: pageSize || 10 }
                }
            }}
        />
    );
}
export default CDataGrid;