import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CListContainer from '../../components/htmlComponent/CListContainer';
import ModalMessage from '../public/ModalMessage';
import { useDeleteApiCall } from '../../utils/apiCalls';
import { apiUrl } from '../../utils/utils';
import {createTextRender, createActionsRender , createStatusRender} from '../../utils/columnUtil';
import Loading from '../../components/htmlComponent/Loading';
import '../../css/Products.css';

const SocialMediaList = () => {
   const navigate = useNavigate();
   const [dataList, setData] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [searchTerm, setSearchTerm] = useState('');
   const { apiSuccess, apiError: deleteError,  apiLoading: deleteLoading, deleteData } = useDeleteApiCall();

    useEffect(() => {
        
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login'); // Kullanıcıyı giriş sayfasına yönlendir
                    return;
                }
                let url = `${apiUrl}/social-media`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Token'ı header'a ekle
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    setData(data.accounts);
                } else {
                    setError('Veriler yüklenirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Veriler yüklenirken hata:', error);
                setError('Sunucu bağlantısı başarısız');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = dataList.filter(p => 
        p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
      
    //#region "state management for delete operation"
    // ...existing state...
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = async (itemId) => {
        const clearCacheKey = [{method:'GET', urlPrefix:`/social-media`}];
        const success = await deleteData(`/social-media/${itemId}`, clearCacheKey);
        if (success) {
            setData(dataList.filter(p => p._id !== itemId));            
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
            headerName: 'Bağlantı Adı',
            flex: 1,
            minWidth: 100,
            renderCell: createTextRender('name', 300)
        },
        {
            field:'mediaLink',
            headerName:'Bağlantı adresi',
            minWidth:350,
            renderCell: createTextRender('mediaLink')
        },
        {
            field: 'active',
            headerName: 'Durumu',
            width: 80,
            renderCell: createStatusRender('active')
        },
        {
            field: 'actions',
            headerName: 'İşlemler',
            width: 130,
            renderCell: createActionsRender([
                {
                    label: 'Düzenle',
                    color: '#369ae7',
                    onClick: (row) => navigate(`/social-media/edit/${row._id}`)
                },
                {
                    label: 'Sil',
                    color: '#f44336',
                //   disabled: (row) => !row.isActivated,
                    onClick: (row) => {
                        setDeleteId(row._id);
                        setModalOpen(true);
                    }
                }
            ])
        }
    ];

    if (loading) {
        return <Loading />;
    }
    return (
        <>
            <CListContainer pageName={'socialmediaList'} 
                error={error} 
                searchTerm={searchTerm} 
                handleSearch={handleSearch} 
                url={'/social-media/new'} 
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

export default SocialMediaList;