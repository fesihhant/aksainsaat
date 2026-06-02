import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CListContainer from '../../components/htmlComponent/CListContainer';
import ModalMessage from '../public/ModalMessage';
import { useApiCall, useDeleteApiCall } from '../../utils/apiCalls';
import { createActionsRender, createDateRender, createTextRender } from '../../utils/columnUtil';
import Loading from '../../components/htmlComponent/Loading';

const TermsOfServiceList = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { apiData, apiError, apiLoading } = useApiCall(
        '/termsOfServices',
        'GET',
        null,
        true,
        { dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );
    const { apiSuccess, apiError: deleteError, apiLoading: deleteLoading, deleteData } = useDeleteApiCall();
    
    useEffect(() => {        
        if (apiData && apiData.termsOfService) {
            if (apiData.success && apiData.termsOfService.length > 0) {  
                setData(apiData.termsOfService);
            } 
        }
        if (apiError) {
            setError((apiData && apiData.message) || 'TermsOfService yüklenirken bir hata oluştu');
        }
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = data.filter(p =>
        (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.content && p.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    //#region "state management for delete operation"
    // ...existing state...
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = async (itemId) => {
        const clearCacheKey = [{method:'GET', urlPrefix:`/termsOfServices`}];
        const success = await deleteData(`/termsOfServices/${itemId}`, clearCacheKey);
        if (success) {
            setData(data.filter(p => p._id !== itemId));
            
        } else if (deleteError) {
            setError(deleteError);
        }
        setLoading(deleteLoading);
    };

    // Modal onaylandığında silme işlemi
    const handleModalConfirm = async () => {
        setModalOpen(false);
        if (deleteId) {
            await handleDelete(deleteId);
            setDeleteId(null);
        }
    };

    // Modal iptal edildiğinde
    const handleModalCancel = () => {
        setModalOpen(false);
        setDeleteId(null);
    };
    //#endregion

        
    const columns = [        
        {
            field: 'title',
            headerName: 'Title',
            flex: 1,
            minWidth: 150,
            renderCell: createTextRender('title', 100)
        },
        {
            field: 'content',
            headerName: 'Content',
            flex: 1,
            renderCell: createTextRender('content', 150)
        },
        {
            field: 'createdAt',
            headerName: 'Kayıt Tarihi',
            width: 150,
            renderCell: createDateRender('createdAt', 'tr-TR')
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 150,
            renderCell: createActionsRender([
                {
                    label: 'Düzenle',
                    color: '#369ae7',
                    onClick: (row) => navigate(`/termsofservices/edit/${row._id}`)
                },
                {
                    label: 'Sil',
                    color: '#f44336',
                    disabled: (row) => data.length,
                    onClick: (row) => {
                        setDeleteId(row._id);
                        if (data.length > 1) setModalOpen(true);
                    }
                }
            ])
        }
    ];    
    
    if(loading) {
        return <Loading />;
    }
    return (
        <>
        <CListContainer pageName={'termsofservices'} 
            error={error} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            url={'/termsofservices/new'} 
            filteredData={filteredData} 
            columns={columns} 
            loading={loading} 
            pageSize={10}
            showNewButton={data.length == 0}
        />         
        <ModalMessage
            open={modalOpen}
            type="warning"
            message="Bu kaydı silmek istediğinize emin misiniz?"
            onConfirm={handleModalConfirm}
            onCancel={handleModalCancel}
        />  
        </>        
    );
};

export default TermsOfServiceList; 
