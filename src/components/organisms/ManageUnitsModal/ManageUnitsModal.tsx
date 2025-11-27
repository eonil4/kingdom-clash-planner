import { Dialog, DialogTitle, DialogContent, Box, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useManageUnits } from '../../../hooks/useManageUnits';
export { AddUnitForm } from '../../organisms';
import { UnitTable } from '../UnitTable';
import { IconButton, Button } from '../../atoms';
import { AddUnitForm } from '../../organisms';

interface ManageUnitsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ManageUnitsModal({ open, onClose }: ManageUnitsModalProps) {
  const {
    units,
    uniqueUnits,
    unitCounts,
    formationUnitCount,
    isAdding,
    editingRowId,
    rowEditData,
    formData,
    selectedLevels,
    levelCounts,
    sortColumn,
    sortDirection,
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
        <span className="text-white font-bold">Manage Units</span>
        <IconButton
          icon={<CloseIcon />}
          onClick={onClose}
          className="text-white hover:bg-gray-700"
          aria-label="Close"
        />
      </DialogTitle>
      <DialogContent className="bg-gray-800 text-white">
        <Box className="space-y-4">
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
              onSelectAllLevels={handleSelectAllLevels}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
          {!isAdding && (
            <Box className="mb-4 flex items-center justify-between gap-2">
              <Typography variant="h6" className="text-white">
                Unit Roster ({Object.values(unitCounts).reduce((sum, count) => sum + count, 0)} total units)
              </Typography>
              <Box className="flex gap-2">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddNew}
                >
                  Add New Unit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearRoster}
                  disabled={units.length === 0}
                >
                  Clear Roster
                </Button>
              </Box>
            </Box>
          )}
          <UnitTable
            uniqueUnits={uniqueUnits}
            unitCounts={unitCounts}
            editingRowId={editingRowId}
            rowEditData={rowEditData}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onRowEdit={handleRowEdit}
            onRowEditChange={handleRowEditChange}
            onRowSave={handleRowSave}
            onRowCancel={handleRowCancel}
            onDelete={handleDelete}
            onSort={handleSort}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}

