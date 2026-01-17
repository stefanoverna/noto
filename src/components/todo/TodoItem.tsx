import { useState, useRef, useEffect } from 'react';
import { Checkbox, Input, Button } from '@heroui/react';
import { motion } from 'framer-motion';
import type { TodoItem } from '../../types/todo';
import { debounce } from '../../lib/utils';

interface TodoItemProps {
  item: TodoItem;
  onToggle: (itemId: string) => void;
  onUpdate: (itemId: string, text: string) => void;
  onDelete: (itemId: string) => void;
}

export function TodoItemComponent({ item, onToggle, onUpdate, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(item.text);
  }, [item.text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const debouncedUpdate = useRef(
    debounce((itemId: string, newText: string) => {
      if (newText.trim()) {
        onUpdate(itemId, newText.trim());
      }
    }, 300)
  ).current;

  const handleTextChange = (value: string) => {
    setText(value);
    debouncedUpdate(item.id, value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (!text.trim()) {
      setText(item.text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setText(item.text);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{
        opacity: item.done ? 0.6 : 1,
        y: 0
      }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 group py-2 px-3 rounded-lg hover:bg-default-100 transition-colors"
    >
      <Checkbox
        isSelected={item.done}
        onValueChange={() => onToggle(item.id)}
        color="success"
        size="lg"
      />

      {isEditing ? (
        <Input
          ref={inputRef}
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          variant="bordered"
          size="sm"
          className="flex-1"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="flex-1 cursor-text"
          style={{
            textDecoration: item.done ? 'line-through' : 'none',
          }}
        >
          {item.text}
        </div>
      )}

      <Button
        isIconOnly
        size="sm"
        variant="light"
        color="danger"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onPress={() => onDelete(item.id)}
      >
        ×
      </Button>
    </motion.div>
  );
}
