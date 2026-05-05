import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CListContainer from '../../components/htmlComponent/CListContainer';
import { useApiCall, useDeleteApiCall } from '../../utils/apiCalls';
import ModalMessage from '../public/ModalMessage';
import '../../css/Products.css';
import { serverUrl } from '../../utils/utils';
import {createRelatedValueGetter, createTextRender, createImageRender, createDateRender, createActionsRender , createStatusRender} from '../../utils/columnUtil';

const Projects = () => {
    const navigate = useNavigate();
    const [projects, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');    
    
    const { apiData, apiError, apiLoading } = useApiCall(
        '/projects',
        'GET',
        null,
        true,
        { dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );
    const { apiSuccess, apiError: deleteError, apiLoading: deleteLoading, deleteData } = useDeleteApiCall();

    useEffect(() => {
        if (apiData && apiData.success) {
            if (apiData.projects && apiData.projects.length > 0) {    
                setData(apiData.projects);
            } 
        }
        if (apiError) {
            setError(apiError.message || 'Veriler yüklenirken bir hata oluştu');
        }
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);
    
    //#region "state management for delete operation"
    // ...existing state...
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = async (itemId) => {
        const clearCacheKey = [{method:'GET', urlPrefix:`/projects`}];
        const success = await deleteData(`/projects/${itemId}`, clearCacheKey);
        if (success) {
            setData(projects.filter(p => p._id !== itemId));
            
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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = projects.filter(p =>
        (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const columns = [
        {
            field: 'imageUrls',
            headerName: 'Görsel',
            width: 100,
            renderCell: createImageRender(serverUrl)
        },
        {
            field: 'name',
            headerName: 'Proje Adı',
            flex: 1,
            minWidth: 150,
            renderCell: createTextRender('name', 100)
        },
        {
            field: 'typeofActivityId.name',
            headerName: 'Faaliyet Türü',
            width: 250,
            renderCell: createRelatedValueGetter('typeofActivityId.name')
        },      
        {
            field: 'statusType',
            headerName: 'Durumu',
            width: 150,
            renderCell: createStatusRender('statusType')
        },
        {
            field: 'startDate',
            headerName: 'Başlama Tarihi',
            width: 126,
            renderCell: createDateRender('startDate', 'tr-TR')
        },
        {
            field: 'projectCost',
            headerName: 'Maliyet',
            width: 150,
            valueFormatter: (params) => { if (!params.value) return '';
                return new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY'
                }).format(params.value);
            }
        },  
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 150,
            renderCell: createActionsRender([
                {
                    label: 'Düzenle',
                    color: '#369ae7',
                    onClick: (row) => navigate(`/projects/edit/${row._id}`)
                },
                {
                    label: 'Sil',
                    color: '#f44336',
                    // disabled: (row) => !row.isActivated,
                    onClick: (row) => {
                        setDeleteId(row._id);
                        setModalOpen(true);
                    }
                }
            ])
        }
    ];
    {loading && (
        <div className="loading-spinner">
            <div className="spinner"></div>
        </div>
    )}
    if (error) {
        return <div className="error-message">{error}</div>;
    }
    return (
        <>
        <CListContainer pageName={'projects'}
            error={error} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            url={'/projects/new'} 
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

export default Projects;
