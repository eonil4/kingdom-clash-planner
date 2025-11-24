import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useAppSelector } from '../../store/hooks';
import { useManageUnits } from '../../hooks/useManageUnits';
import AddUnitForm from './AddUnitForm';
import UnitTable from './UnitTable';

interface ManageUnitsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageUnitsModal({ open, onClose }: ManageUnitsModalProps) {
  const { units } = useAppSelector((state) => state.unit);
  
  const {
    uniqueUnits,
    unitCounts,
    formationUnitCount,
    isAdding,
    editingId,
    editingRowId,
    rowEditData,
    formData,
    selectedLevels,
    levelCounts,
    sortColumn,
    sortDirection,
    filters,
    handleAddNew,
    handleRowEdit,
    handleRowEditChange,
    handleRowSave,
    handleRowCancel,
    handleClearRoster,
    handleSave,
    handleCancel,
    handleLevelToggle,
    handleLevelCountChange,
    handleSelectAllLevels,
    handleDelete,
    handleNameChange,
    handleSort,
    handleFilterChange,
    handleClearFilters,
  } = useManageUnits();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: 'bg-gray-800',
      }}
    >
      <DialogTitle className="flex items-center justify-between bg-gray-900">
        <span className="text-white font-bold">
          Manage Units
        </span>
        <IconButton
          onClick={onClose}
          className="text-white hover:bg-gray-700"
          aria-label="Close manage units modal"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className="bg-gray-800">
        <Box className="mb-4">
          <Box className="flex items-center justify-between mb-4">
            <Typography variant="h6" className="text-white">
              Unit Roster ({units.length} total units)
            </Typography>
            <Box className="flex gap-2">
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                className="bg-green-600 hover:bg-green-700"
                disabled={isAdding || editingId !== null}
              >
                Add New Unit
              </Button>
              <Button
                variant="contained"
                onClick={handleClearRoster}
                className="bg-red-600 hover:bg-red-700"
                disabled={units.length === 0 || isAdding || editingId !== null || editingRowId !== null}
              >
                Clear Roster
              </Button>
            </Box>
          </Box>

          {isAdding && (
            <AddUnitForm
              formData={formData}
              selectedLevels={selectedLevels}
              levelCounts={levelCounts}
              units={units}
              formationUnitCount={formationUnitCount}
              onNameChange={handleNameChange}
              onLevelToggle={handleLevelToggle}
              onLevelCountChange={handleLevelCountChange}
              onSelectAllLevels={() => handleSelectAllLevels()}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}

          <UnitTable
            uniqueUnits={uniqueUnits}
            unitCounts={unitCounts}
            editingRowId={editingRowId}
            rowEditData={rowEditData}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            filters={filters}
            onSort={handleSort}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onRowEdit={handleRowEdit}
            onRowEditChange={handleRowEditChange}
            onRowSave={handleRowSave}
            onRowCancel={handleRowCancel}
            onDelete={handleDelete}
          />
        </Box>
      </DialogContent>
      
      <DialogActions className="bg-gray-900">
        <Button
          onClick={onClose}
          className="text-white hover:bg-gray-700"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
