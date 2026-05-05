import { Button, Space } from 'antd';

const MailLinks =({mailaddress = 'aksainsaat12@gmail.com'}) => {
  return (
      <Space direction="horizontal" className='mail-link' >
        {/* Varsayılan sistem mail uygulaması */}
        {/* <Button type="primary">
          <a href={`mailto:${mailaddress}?subject=Destek&body=Merhaba`}>
          <i className="fa-solid fa-envelope"></i> E-Posta
          </a>
        </Button> */}

        {/* Gmail */}
        {/* <Button type='primary'> */}
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${mailaddress}&su=Destek&body=Merhaba`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color:'inherit', marginLeft: 6 }}
          >
          <i className="fa-solid fa-envelope"></i> {mailaddress}
          </a>
        {/* </Button> */}

        {/* Outlook Web */}
        {/* <Button type='primary'>
          <a
            href={`https://outlook.live.com/mail/0/deeplink/compose?to=${mailaddress}&subject=Destek&body=Merhaba`}
            target="_blank"
            rel="noopener noreferrer"
          >
          <i className="fa-solid fa-envelope"></i> Outlook
          </a>
        </Button> */}

        {/* Yahoo Mail */}
        {/* <Button type='primary'>
          <a
            href={`https://compose.mail.yahoo.com/?to=${mailaddress}&subject=Destek&body=Merhaba`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fa-solid fa-envelope"></i> Yahoo
          </a>
        </Button> */}
      </Space>
  );
}

export default MailLinks;
