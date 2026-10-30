// ⚙️ Bibliotecas externas
import { useEffect, useState } from "react";
import { PencilLine, Trash } from "lucide-react";
import { useHistory } from 'react-router-dom';

// 💅 Estilos
import styles from './CategoryList.module.css';

// 🧩 Componentes
import TableHeader from "../../../../../components/header/TableHeader/TableHeader";
import ActionHeader from "../../../../../components/header/ActionHeader/ActionHeader";
import Table from "../../../../../components/table/Table";
import Pagination from "../../../../../components/pagination/Pagination";
import ConfirmModal from './../../../../../components/modal/ConfirmModal';

// 🔧 Services e Hooks
import ServiceCategory from "./services/ServiceCategory";
import useFlashMessage from './../../../../../hooks/userFlashMessage';
import LoadingSpinner from "../../../../../components/loading/LoadingSpinner";

const CategoryList = () => {
  const history = useHistory();
  const { setFlashMessage } = useFlashMessage();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

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
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await ServiceCategory.getByAllCategory(
          currentPage,
          debouncedSearchTerm,
          sortBy,
          order
        );
        if (response.data.status === 'OK') {
          setCategories(response.data.data);
          setTotalItems(response.data.totalRegisters);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setFlashMessage('Erro ao buscar categorias', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
    { key: 'description', label: 'Descrição' },
    { key: 'type', label: 'Tipo' },
    {
      key: 'actions',
      label: 'Ações',
      sortable: false,
      render: (row, idx, { onEdit, onDelete }) => (
        <div className={styles.actionsCell}>
          <button
            className={styles.editButton}
            onClick={() => onEdit(row.id)}
            title="Editar categoria"
            aria-label={`Editar categoria ${row.name}`}
          >
            <PencilLine size={17} />
          </button>
          <button 
            className={styles.deleteButton} 
            onClick={() => onDelete(row.id)}
            title="Excluir categoria"
            aria-label={`Excluir categoria ${row.name}`}
          >
            <Trash size={17} />
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

  const handleEdit = (categoryId) => {
    history.push(`/categoria/form/${categoryId}`);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      await ServiceCategory.deleteCategory(categoryToDelete);
      setFlashMessage('Categoria excluída com sucesso', 'success');
      
      const response = await ServiceCategory.getByAllCategory(
        currentPage,
        debouncedSearchTerm,
        sortBy,
        order
      );
      if (response.data.status === 'OK') {
        setCategories(response.data.data);
        setTotalItems(response.data.totalRegisters);
        window.dispatchEvent(new CustomEvent('refreshSidebar'));
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      setFlashMessage('Erro ao excluir categoria', 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleDelete = (categoryId) => {
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };

  const handleBack = () => {
    history.push('/configuracoes');
  };

  const handleCreate = () => {
    history.push('/categoria/form');
  };

  const handleSelectionChange = (selectedItems) => {
    console.log('Selected items:', selectedItems);
  };

  const sortConfig = sortBy ? { key: sortBy, direction: order } : { key: null, direction: null };

  if (loading && categories.length === 0) {
            return (
              <LoadingSpinner message="Carregando categorias..." fullscreen />
            );

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
        title="Categorias"
        searchPlaceholder="Pesquisar por nome"
        onSearch={setSearchTerm}
      />

      <Table
        columns={columns}
        data={categories}
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
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteCategory}
        title="Confirmar exclusão de categoria"
        message="Tem certeza que deseja excluir esta categoria? Esta ação é irreversível."
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        danger={true}
        loading={isDeleting}
      />
    </div>
  );
};

export default CategoryList;
