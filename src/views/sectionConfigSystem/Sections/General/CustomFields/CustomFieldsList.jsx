// ⚙️ Bibliotecas externas
import { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { useHistory } from 'react-router-dom';

// 💅 Estilos
import styles from './CustomFieldsList.module.css';

// 🧩 Componentes
import TableHeader from "../../../../../components/header/TableHeader/TableHeader";
import ActionHeader from "../../../../../components/header/ActionHeader/ActionHeader";
import Table from "../../../../../components/table/Table";
import Pagination from "../../../../../components/pagination/Pagination";
import ConfirmModal from '../../../../../components/modal/ConfirmModal';

// 🔧 Services e Hooks
import ServiceCustomFields from "./services/ServiceCustomFields";
import useFlashMessage from '../../../../../hooks/userFlashMessage';
import LoadingSpinner from "../../../../../components/loading/LoadingSpinner";

const CustomFieldsList = () => {
  const history = useHistory();
  const { setFlashMessage } = useFlashMessage();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [customFields, setCustomFields] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [customFieldsToDelete, setCustomFieldsToDelete] = useState(null);

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
    const fetchCustomFields = async () => {
      setLoading(true);
      try {
        const response = await ServiceCustomFields.getByAllCustomFields(
          currentPage,
          debouncedSearchTerm,
          sortBy,
          order
        );
        if (response.data.status === 'OK') {
          setCustomFields(response.data.data);
          setTotalItems(response.data.totalRegisters);
        }
      } catch (error) {
        console.error('Erro ao buscar Campo Customizado:', error);
        setFlashMessage('Erro ao buscar Campo Customizado', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomFields();
  }, [currentPage, debouncedSearchTerm, sortBy, order]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
// TODO: Implementar coluna de record types
  const columns = [
    {
      key: 'label',
      label: 'Nome',
      render: (row) => (
        <div className={styles.nameCell}>
          <div>{row.label}</div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (row) => (
        <div className={styles.descriptionCell}>
          <div>{row.description}</div>
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

  const handleEdit = (customFieldsId) => {
    history.push(`/custom-fields/form/${customFieldsId}`);
  };

  const handleDeleteCustomFields = async () => {
    if (!customFieldsToDelete) return;

    try {
      setIsDeleting(true);
      await ServiceCustomFields.deleteCustomFields(customFieldsToDelete);
      setFlashMessage('Campo Customizado excluído com sucesso', 'success');
      
      const response = await ServiceCustomFields.getByAllCustomFields(
        currentPage,
        debouncedSearchTerm,
        sortBy,
        order
      );
      if (response.data.status === 'OK') {
        setCustomFields(response.data.data);
        setTotalItems(response.data.totalRegisters);
      }
    } catch (error) {
      console.error('Erro ao excluir Campo Customizado:', error);
      setFlashMessage('Erro ao excluir Campo Customizado', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setCustomFieldsToDelete(null);
    }
  };

  const handleDelete = (customFieldsId) => {
    setCustomFieldsToDelete(customFieldsId);
    setShowDeleteModal(true);
  };

  const handleBack = () => {
    history.push('/configuracoes');
  };

  const handleCreate = () => {
    history.push('/custom-fields/form');
  };

  const handleSelectionChange = (selectedItems) => {
    console.log('Selected items:', selectedItems);
  };

  const sortConfig = sortBy ? { key: sortBy, direction: order } : { key: null, direction: null };

  if (loading && customFields.length === 0) {
    return <LoadingSpinner message="Carregando campos customizados..." />; 
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
        title="Campos Customizados"
        searchPlaceholder="Pesquisar por nome"
        onSearch={setSearchTerm}
      />

      <Table
        columns={columns}
        data={customFields}
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
          setCustomFieldsToDelete(null);
        }}
        onConfirm={handleDeleteCustomFields}
        title="Confirmar exclusão de Campos Customizados"
        message="Tem certeza que deseja excluir esta Campos Customizados? Esta ação é irreversível."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};

export default CustomFieldsList;