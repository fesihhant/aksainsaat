import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CListContainer from '../../components/htmlComponent/CListContainer';
import { useDeleteApiCall } from '../../utils/apiCalls';
import '../../css/Products.css';
import { apiUrl, serverUrl } from '../../utils/utils';
import { createImageRender, createTextRender, createActionsRender } from '../../utils/columnUtil';
import ModalMessage from '../public/ModalMessage';

const References = () => {
    const navigate = useNavigate();
    const [references, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { apiSuccess, apiError: deleteError, apiLoading: deleteLoading, deleteData } = useDeleteApiCall();
    
    useEffect(() => {
        const fetchReferences = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login'); // Kullanıcıyı giriş sayfasına yönlendir
                    return;
                }
                const response = await fetch(`${apiUrl}/references`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();

                if (data.success) {
                    setData(data.references);
                } else {
                    setError('Referanslar yüklenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Referanslar yüklenirken hata:', error);
                setError('Sunucu bağlantısı başarısız');
            } finally {
                setLoading(false);
            }
        };

        fetchReferences();
    }, []);

    //#region "state management for delete operation"
    // ...existing state...
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = async (itemId) => {
        const clearCacheKey = [{method:'GET', urlPrefix:`/references`}];
        const success = await deleteData(`/references/${itemId}`, clearCacheKey);
        if (success) {
            setData(references.filter(p => p._id !== itemId));
            
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

    const filteredData = references.filter(p =>
       (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const columns = [
        {
            field: 'imageUrl',
            headerName: 'Görsel',
            width: 100,
            renderCell: createImageRender(serverUrl)
        },
        {
            field: 'name',
            headerName: 'Referans Adı',
            flex: 1,
            minWidth: 200,
            renderCell: createTextRender('name')
        }, 
        {
            field: 'description',
            headerName: 'Açıklama',
            flex: 1,
            minWidth: 200,
            renderCell: createTextRender('description', 300)
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 150,
            renderCell: createActionsRender([
                {
                    label: 'Düzenle',
                    color: '#369ae7',
                    onClick: (row) => navigate(`/reference/edit/${row._id}`)
                },
                {
                    label: 'Sil',
                    color: '#f44336',
                    onClick: (row) => {
                        setDeleteId(row._id);
                        setModalOpen(true);
                    }
                }
            ])
            // renderCell: (params) => (
            
            //     <div style={{ display: 'flex', gap: '8px' }}>
            //         <button
            //             onClick={(e) => {
            //                 e.stopPropagation();
            //                 // navigate(`/reference/edit/${params.row._id}`);
            //                 navigate('/referencedetail', { state: {referenceData: params.row }});
            //             }}
            //             className='submit-button'
            //         >
            //             Düzenle
            //         </button>
            //         <button
            //             onClick={async (e) => {
            //                 e.stopPropagation();
            //                 setDeleteId(params.row._id);
            //                 setModalOpen(true);
            //             }}
            //             className='cancel-button'
            //         >
            //             Sil
            //         </button>
            //     </div>
            // )
        }
    ];

    return (
        <>
        <CListContainer pageName={'references'} 
            error={error} 
            searchTerm={searchTerm} 
            handleSearch={handleSearch} 
            url={'/reference/new'} 
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

export default References;
