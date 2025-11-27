import HelpIcon from '@mui/icons-material/Help';
import { IconButton } from '../../atoms';
import { EditableText } from '../EditableText';

interface FormationNameEditorProps {
  name: string;
  onSave: (name: string) => void;
  onHelpClick: () => void;
}

export default function FormationNameEditor({ name, onSave, onHelpClick }: FormationNameEditorProps) {
  return (
    <EditableText
      value={name}
      onSave={onSave}
      placeholder="Formation"
      variant="h6"
      className="mb-2"
      editAriaLabel="Edit formation name"
      leftAction={
        <IconButton
          icon={<HelpIcon fontSize="small" />}
          size="small"
          onClick={onHelpClick}
          className="text-white hover:text-blue-400"
          aria-label="Open help overlay"
        />
      }
    />
  );
}

