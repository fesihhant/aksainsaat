
import { Helmet } from 'react-helmet-async';

const CHelmet = ({pageName, content, categoryName}) => {

    return (
        <Helmet>
            <title>{pageName} | Aksa İnşaat</title>
            <meta name="description" content={`${pageName} , ${content} Aksa inşaat tarafından geliştirilen tüm projeleri burada bulabilirsiniz.`} />
            <meta name="keywords" content={`projeler, inşaat, doğalgaz, faaliyetler, Ankara, İzmir,İstanbul, Bingöl, Kocaeli, iller, belediye, bakanlık${categoryName}`} />
            <meta property="og:title" content={`${pageName},${content}`} />
            <meta property="og:description" content={`Aksa inşaat'ın geliştirdiği ${content} projeler hakkında detaylı bilgi alın.`} />
        </Helmet>
    );
}
export default CHelmet;