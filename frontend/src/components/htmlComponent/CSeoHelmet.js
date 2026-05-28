import { Helmet } from 'react-helmet-async';
import {serverUrl} from "../../utils/utils";

const CSeoHelmet = ({ pageName, content, categoryName, canonicalUrl, ogImage }) => {
  return (
    <Helmet>
      {/* Title & Description */}
      <title>{pageName} | Aksa İnşaat</title>
      <meta
        name="description"
        content={`${pageName}, ${content}. Aksa İnşaat tarafından geliştirilen tüm projeleri burada bulabilirsiniz.`}
      />

      {/* Keywords */}
      <meta
        name="keywords"
        content={`projeler, inşaat, doğalgaz, faaliyetler, Ankara, İzmir, İstanbul, Bingöl, Kocaeli, iller, belediye, bakanlık, ${categoryName}`}
      />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={serverUrl + canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:title" content={`${pageName}, ${content}`} />
      <meta
        property="og:description"
        content={`Aksa İnşaat'ın geliştirdiği ${content} projeler hakkında detaylı bilgi alın.`}
      />
      {ogImage && <meta property="og:image" content={ serverUrl + ogImage} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Aksa İnşaat" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${pageName} | Aksa İnşaat`} />
      <meta
        name="twitter:description"
        content={`Aksa İnşaat'ın geliştirdiği ${content} projeler hakkında detaylı bilgi alın.`}
      />
      {ogImage && <meta name="twitter:image" content={ serverUrl + ogImage} />}
    </Helmet>
  );
};

export default CSeoHelmet;
