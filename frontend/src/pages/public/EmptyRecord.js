import React from 'react';
const EmptyRecord = ({message}) => {
return (
    // <div className="empty-box"> 
    //     <i className="fa fa-exclamation-triangle"></i>
    //     <div className="empty-data">{message}</div>
    //     {isStartShopping && (
    //         <a href={`/${startShoppingText}`} className="empty-box-link">
    //             {startShoppingText}
    //         </a>
    //     )}  
    // </div>
    <div className="box-items">
    <div className="empty-box">
        <div>
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{message ? message : 'Proje bulunamadı.'  }</span>
        </div>
            
    </div>
</div>
);
}
export default EmptyRecord;