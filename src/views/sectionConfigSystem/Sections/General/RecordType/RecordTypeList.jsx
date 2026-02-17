// ⚙️ Bibliotecas externas
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useHistory } from 'react-router-dom';

// 💅 Estilos
import styles from './RecordTypeList.module.css';

// 🧩 Componentes
import TableHeader from "../../../../../components/header/TableHeader/TableHeader";
import ActionHeader from "../../../../../components/header/ActionHeader/ActionHeader";
import Table from "../../../../../components/table/Table";
import Pagination from "../../../../../components/pagination/Pagination";
import ConfirmModal from '../../../../../components/modal/ConfirmModal';

// 🔧 Services e Hooks
import ServiceRecordType from "./services/ServiceRecordType";
import useFlashMessage from '../../../../../hooks/userFlashMessage';
import LoadingSpinner from './../../../../../components/loading/LoadingSpinner';

const RecordTypeList = () => {
  const history = useHistory();
  const { setFlashMessage } = useFlashMessage();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [recordTypes, setRecordTypes] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [RecordTypeToDelete, setRecordTypeToDelete] = useState(null);

  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); 
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const fetchRecordTypes = async () => {
      setLoading(true);
      try {
        const response = await ServiceRecordType.getByAllRecordType(
          currentPage,
          debouncedSearchTerm,
          sortBy,
          order
        );
        if (response.data.status === 'OK') {
          setRecordTypes(response.data.data);
          setTotalItems(response.data.totalRegisters);
        }
      } catch (error) {
        console.error('Erro ao buscar record types:', error);
        setFlashMessage('Erro ao buscar record types', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecordTypes();
  }, [currentPage, debouncedSearchTerm, sortBy, order]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const columns = [
    {
      key: 'name',
      label: 'Nome',
      render: (row) => (
        <div className={styles.nameCell}>
          <div>{row.name}</div>
        </div>
      )
    },
    { key: 'created_at', label: 'Data de crianção', render: (row) => new Date(row.created_at).toLocaleDateString() },
    {
      key: 'actions',
      label: 'Ações',
      sortable: false,
      render: (row, idx, { onEdit, onDelete }) => (
        <div className={styles.actionsCell}>
          <button className={styles.editButton} onClick={() => onEdit(row.id)}>
            <Edit size={16} />
          </button>
          <button 
            className={styles.deleteButton} 
            onClick={() => onDelete(row.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  const handleSort = (key, direction) => {
    setSortBy(direction ? key : '');
    setOrder(direction || '');
    setCurrentPage(1);
  };

  const handleEdit = (recordTypeId) => {
    history.push(`/record-type/form/${recordTypeId}`);
  };

  const handleDeleteRecordType = async () => {
    if (!RecordTypeToDelete) return;

    try {
      setIsDeleting(true);
      await ServiceRecordType.deleteRecordType(RecordTypeToDelete);
      setFlashMessage('Record Type excluído com sucesso', 'success');
      
      const response = await ServiceRecordType.getByAllRecordType(
        currentPage,
        debouncedSearchTerm,
        sortBy,
        order
      );
      if (response.data.status === 'OK') {
        setRecordTypes(response.data.data);
        setTotalItems(response.data.totalRegisters);
        window.dispatchEvent(new CustomEvent('refreshSidebar'));
      }
    } catch (error) {
      console.error('Erro ao excluir record Type:', error);
      setFlashMessage('Erro ao excluir record Type', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setRecordTypeToDelete(null);
    }
  };

  const handleDelete = (recordTypeId) => {
    setRecordTypeToDelete(recordTypeId);
    setShowDeleteModal(true);
  };

  const handleBack = () => {
    history.push('/configuracoes');
  };

  const handleCreate = () => {
    history.push('/record-type/form');
  };

  const handleSelectionChange = (selectedItems) => {
    console.log('Selected items:', selectedItems);
  };

  const sortConfig = sortBy ? { key: sortBy, direction: order } : { key: null, direction: null };

  if (loading && recordTypes.length === 0) {
        return <LoadingSpinner message="Carregando os tipos de registros..." />; 

  }

  return (
    <div className={styles.container}>
      <ActionHeader
        onBack={handleBack}
        onCreate={handleCreate}
        backButtonLabel="Voltar"
        createButtonLabel="Criar"
      />

      <TableHeader
        title="Record Types"
        searchPlaceholder="Pesquisar por nome"
        onSearch={setSearchTerm}
      />

      <Table
        columns={columns}
        data={recordTypes}
        selectable={false}
        reorderable={true}
        onSelectionChange={handleSelectionChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortConfig={sortConfig}
        onSort={handleSort}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRecordTypeToDelete(null);
        }}
        onConfirm={handleDeleteRecordType}
        title="Confirmar exclusão de record Type"
        message="Tem certeza que deseja excluir esta record Type? Esta ação é irreversível."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};

export default RecordTypeList;