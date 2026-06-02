import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CListContainer from '../../components/htmlComponent/CListContainer';
import ModalMessage from '../public/ModalMessage';
import { useApiCall, useDeleteApiCall } from '../../utils/apiCalls';
import {createTextRender, createActionsRender,createDateRender} from '../../utils/columnUtil';
import Loading from '../../components/htmlComponent/Loading';

const CategoryTypes = () => {
    const navigate = useNavigate();
    const [categoryTypes, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { apiData, apiError, apiLoading } = useApiCall(
        '/categoryTypes',
        'GET',
        null,
        true,
        { dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );
    const { apiError: deleteError, apiLoading: deleteLoading, deleteData } = useDeleteApiCall();
    
    useEffect(() => {
        if (apiData && apiData.categoryTypes) {
            if (apiData.success && apiData.categoryTypes.length > 0) {    
                setData(apiData.categoryTypes);
            } 
        }
        if (apiError) {
            setError(apiData.message || 'Kategoriler yüklenirken bir hata oluştu');
        }
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = categoryTypes.filter(p =>
        p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    //#region "state management for delete operation"
    // ...existing state...
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = async (itemId) => {
        const clearCacheKey = [{method:'GET', urlPrefix:`/categoryTypes`}];
        const success = await deleteData(`/categoryTypes/${itemId}`, clearCacheKey);
        if (success) {
            setData(categoryTypes.filter(cat => cat._id !== itemId));
            
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
            field: 'name',
            headerName: 'Kategori Türü',
            flex: 1,
            minWidth: 150,
            renderCell: createTextRender('name', 300)
        },
        {
            field: 'createdAt',
            headerName: 'Kayıt Tarihi',
            width: 150,
            renderCell: createDateRender('createdAt')
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 150,
            renderCell: createActionsRender([
                {
                    label: 'Düzenle',
                    color: '#369ae7',
                    onClick: (row) => navigate(`/categoryTypes/edit/${row._id}`)
                } 
                // ,{
                //     label: 'Sil',
                //     color: '#f44336',
                //     onClick: (row) => {
                //         setDeleteId(row._id);
                //         setModalOpen(true);
                //     }
                // }
            ])
        }
    ];    
    
    if (loading) {
        return <Loading />;
    }
    
    return (
        <>
        <CListContainer pageName={'categoryTypes'} 
            error={error} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            url={'/categoryTypes/new'} 
            filteredData={filteredData} 
            columns={columns} 
            loading={loading} 
            pageSize={10}
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

export default CategoryTypes;
