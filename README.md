# Hair Shop Admin

A React-based admin panel for managing hair shop products and variants, built with Ant Design and TypeScript.

## Features

- **Add Product**: Create new products with detailed information including name, description, pricing, and category
- **Add Variant**: Create product variants with colors, pricing, stock quantities, and image uploads
- **Color Management**: Create and manage colors dynamically with real-time updates
- **Image Upload**: Drag-and-drop image upload with preview and validation
- **Responsive Design**: Clean, modern UI built with Ant Design components

## API Integration

The application integrates with the Hair Shop API at `https://api.perukytyt.com` and supports:

- Product creation and management
- Variant creation with image uploads
- Color creation and management
- Real-time form validation and error handling

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── AddProduct.tsx      # Product creation form
│   ├── AddVariant.tsx      # Variant creation form with color management
│   └── Layout.tsx          # Main application layout with navigation
├── services/
│   └── api.ts              # API service with type definitions
├── App.tsx                 # Main application component
└── main.tsx               # Application entry point
```

## Usage

### Adding a Product

1. Navigate to "Add Product" in the sidebar
2. Fill in the required fields:
   - Product Name (required)
   - Category ID (required)
   - Optional: Display Name, Description, Type, Length, Pricing
3. Click "Create Product"

### Adding a Variant

1. Navigate to "Add Variant" in the sidebar
2. Select a product from the dropdown
3. Fill in variant details:
   - SKU (required)
   - Price (required)
   - Color (select existing or create new)
   - Stock Quantity (required)
4. Upload images using drag-and-drop
5. Click "Create Variant"

### Creating Colors

1. In the Add Variant form, click "Create New Color" in the color dropdown
2. Fill in color details:
   - Color Name (required)
   - Optional: Display Name, Color Category
3. Click "Create Color" - the color will be immediately available in the dropdown

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Ant Design** - UI component library
- **Axios** - HTTP client
- **Vite** - Build tool and dev server

## API Endpoints Used

- `POST /v1/colors` - Create colors
- `GET /v1/products` - Get all products
- `POST /v1/products` - Create products
- `POST /v1/variants` - Create variants with images
- `POST /v1/variants/{id}/images` - Add images to variants

## Development

The application uses Vite for fast development with hot module replacement. The build process compiles TypeScript and bundles the application for production deployment.