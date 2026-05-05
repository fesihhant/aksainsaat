import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CListContainer from '../../components/htmlComponent/CListContainer';
import ModalMessage from '../public/ModalMessage';
import { useApiCall, useDeleteApiCall } from '../../utils/apiCalls';
import { serverUrl } from '../../utils/utils';
import {
    createSafeRenderCell,
    createAvatarRender,
    createStatusRender,
    createDateRender,
    createLinkRender,
    createActionsRender} from '../../utils/columnUtil';

const Users = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [users, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { apiData, apiError, apiLoading } = useApiCall(
        '/users',
        'GET',
        null,
        true,
        { dedupe: true, timeoutMs: 45000, retry: 1, retryDelayMs: 500 }
    );
    const { apiSuccess, apiError: deleteError, apiLoading: deleteLoading, deleteData } = useDeleteApiCall();

    useEffect(() => {
        if (apiData && apiData.users) {
            if (apiData.success && apiData.users.length > 0) {
                setData(apiData.users);
            }
        }
        if (apiError) {
            // apiError taşırken apiData null olabiliyor; güvenli oku
            setError(apiError.message || 'Veriler yüklenirken bir hata oluştu');
        }
        setLoading(apiLoading);
    }, [apiData, apiError, apiLoading]);


    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredData = users.filter(user =>
       (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
       (user.email&& user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    //#region "state management for delete operation"
    // ...existing state...
    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const handleDelete = async (itemId) => {
        const clearCacheKey = [{method:'GET', urlPrefix:`/users`}];
        const success = await deleteData(`/users/${itemId}`, clearCacheKey);
        if (success) {
            setData(users =>
            users.map(user =>
                user._id === itemId ? { ...user, isActivated: false } : user
            ));

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
            field: 'avatar',
            headerName: 'Avatar',
            width: 120,
            renderCell: createAvatarRender(serverUrl)
        },
        {
            field: 'fullName',
            headerName: 'Ad Soyad',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'email',
            headerName: 'E-posta',
            flex: 1,
            minWidth: 200,
            renderCell: createLinkRender('email')
        },
        {
            field: 'role',
            headerName: 'Yetki',
            width: 120,
            renderCell:  createSafeRenderCell((params) => params.row.role || 'user')
        },
        {
            field: 'isActivated',
            headerName: 'Durumu',
            width: 120,
            renderCell: createStatusRender('isActivated')
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
                    onClick: (row) => navigate(`/users/edit/${row._id}`)
                },
                {
                    label: 'Sil',
                    color: '#f44336',
                    disabled: (row) => !row.isActivated,
                    onClick: (row) => {
                        setDeleteId(row._id);
                        setModalOpen(true);
                    }
                }
            ])
        }
    ];

    if (!currentUser || currentUser.role !== 'admin') {
        return <div>Bu sayfaya erişim yetkiniz yok.</div>;
    }
    if (loading) {
        return <div className="loading">Yükleniyor...</div>;
    }

    return (
        <>
            <CListContainer pageName={'users'}
                error={error}
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                url={'/users/new'}
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

export default Users;
