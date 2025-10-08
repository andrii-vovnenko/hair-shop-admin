import React, { useState } from 'react';
import {
  Button,
  Space,
  Image,
  Popconfirm,
  message,
  Card,
  Typography,
  Spin
} from 'antd';
import {
  DeleteOutlined,
  EyeOutlined,
  HolderOutlined
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getImageUrlByKey } from '../services/api';
import type { Image as ImageType } from '../services/api';

const { Text } = Typography;

interface DraggableImageTableProps {
  images: ImageType[];
  onImageDelete: (imageId: string) => void;
  onImageReorder: (reorderedImages: ImageType[]) => void;
  loading?: boolean;
}

interface SortableImageItemProps {
  image: ImageType;
  onDelete: (imageId: string) => void;
}

const SortableImageItem: React.FC<SortableImageItemProps> = ({ image, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const imageKey = image.url.split('/').pop() || image.url;
  const optimizedUrl = getImageUrlByKey(imageKey, {
    width: 60,
    height: 60,
    quality: 60,
    format: 'webp'
  });

  const fullSizeUrl = getImageUrlByKey(imageKey, {
    width: 800,
    height: 600,
    quality: 80,
    format: 'webp'
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        padding: '12px',
        border: '1px solid #d9d9d9',
        borderRadius: '6px',
        marginBottom: '8px',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <Button
        type="text"
        icon={<HolderOutlined />}
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', padding: '4px' }}
        size="small"
      />
      
      <Image
        width={60}
        height={60}
        src={optimizedUrl}
        style={{ objectFit: 'cover', borderRadius: '4px' }}
      />
      
      <div style={{ flex: 1 }}>
        <Text strong>Sort Order: {image.sort_order}</Text>
      </div>
      
      <Space>
        <Button 
          type="default" 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => window.open(fullSizeUrl, '_blank')}
        >
          View
        </Button>
        <Popconfirm
          title="Are you sure you want to delete this image?"
          onConfirm={() => onDelete(image.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      </Space>
    </div>
  );
};

const DraggableImageTable: React.FC<DraggableImageTableProps> = ({
  images,
  onImageDelete,
  onImageReorder,
  loading = false
}) => {
  const [localImages, setLocalImages] = useState<ImageType[]>(images);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    setLocalImages(images);
  }, [images]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = localImages.findIndex((image) => image.id === active.id);
      const newIndex = localImages.findIndex((image) => image.id === over?.id);

      const newImages = arrayMove(localImages, oldIndex, newIndex);
      
      // Update sort_order for all images
      const updatedImages = newImages.map((image, index) => ({
        ...image,
        sort_order: index + 1
      }));

      setLocalImages(updatedImages);
      setIsReordering(true);
    }
  };

  const handleSaveOrder = async () => {
    try {
      await onImageReorder(localImages);
      setIsReordering(false);
      message.success('Image order updated successfully');
    } catch (error) {
      message.error('Failed to update image order');
      // Revert to original order on error
      setLocalImages(images);
    }
  };

  const handleCancelOrder = () => {
    setLocalImages(images);
    setIsReordering(false);
  };

  if (loading) {
    return (
      <Card title="Images">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title="Images" 
      extra={
        isReordering && (
          <Space>
            <Button size="small" onClick={handleCancelOrder}>
              Cancel
            </Button>
            <Button type="primary" size="small" onClick={handleSaveOrder}>
              Save Order
            </Button>
          </Space>
        )
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localImages.map(img => img.id)}
          strategy={verticalListSortingStrategy}
        >
          <div>
            {localImages.map((image) => (
              <SortableImageItem
                key={image.id}
                image={image}
                onDelete={onImageDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {localImages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <Text type="secondary">No images uploaded yet</Text>
        </div>
      )}
    </Card>
  );
};

export default DraggableImageTable;
