import {
  Box,
  Button,
  Container,
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Heading,
  HStack,
  IconButton,
  Image,
  Input,
  SimpleGrid,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useProductsStore } from "../store/product";
import { toaster } from "@/components/ui/toaster";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

const HomePage = () => {
  const { products, pagination, fetchProducts, deleteProduct, updateProduct } =
    useProductsStore();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedProduct, setEditedProduct] = useState({});
  const [productToEdit, setProductToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const bg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await fetchProducts(currentPage, 9); // 9 products per page (3x3 grid)
      setLoading(false);
    };
    loadProducts();
  }, [currentPage, fetchProducts]);

  const handlePageChange = (newPage) => {
    // Prevent invalid page numbers
    if (newPage < 1 || (pagination && newPage > pagination.pages)) {
      return;
    }
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      const { success, message, shouldRefetch } = await deleteProduct(
        productToDelete._id
      );
      toaster.create({
        title: success ? "Success" : "Error",
        description: message,
        type: success ? "success" : "error",
        duration: 3000,
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);

      // Refetch to update pagination
      if (shouldRefetch) {
        await fetchProducts(currentPage, 9);
      }
    }
  };

  const handleEditClick = (product) => {
    setProductToEdit(product);
    setEditedProduct({
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (productToEdit) {
      const { success, message } = await updateProduct(
        productToEdit._id,
        editedProduct
      );
      toaster.create({
        title: success ? "Success" : "Error",
        description: message,
        type: success ? "success" : "error",
        duration: 3000,
      });
      if (success) {
        setEditDialogOpen(false);
        setProductToEdit(null);
        setEditedProduct({});
      }
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setProductToEdit(null);
    setEditedProduct({});
  };

  return (
    <Container maxW={"container.xl"} py={12}>
      <VStack spacing={8}>
        <Heading
          as={"h1"}
          size={"2xl"}
          textAlign={"center"}
          bgGradient={"to-r"}
          gradientFrom={"cyan.400"}
          gradientTo={"blue.500"}
          bgClip={"text"}
        >
          Current Products 🚀
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={10} w={"full"}>
          {products.map((product) => (
            <Box
              key={product._id}
              shadow={"lg"}
              rounded={"lg"}
              overflow={"hidden"}
              transition={"all 0.3s"}
              _hover={{ transform: "translateY(-5px)", shadow: "xl" }}
              bg={bg}
            >
              <Image
                src={product.image}
                alt={product.name}
                h={48}
                w={"full"}
                objectFit={"cover"}
              />

              <Box p={4}>
                <Heading as={"h3"} size={"md"} mb={2}>
                  {product.name}
                </Heading>

                <Text
                  fontWeight={"bold"}
                  fontSize={"xl"}
                  color={textColor}
                  mb={4}
                >
                  ${product.price}
                </Text>

                <HStack spacing={2} mt={3}>
                  <IconButton
                    colorScheme="blue"
                    onClick={() => handleEditClick(product)}
                    size="sm"
                  >
                    <FiEdit2 />
                  </IconButton>
                  <IconButton
                    colorScheme="red"
                    onClick={() => handleDeleteClick(product)}
                    size="sm"
                  >
                    <FiTrash2 />
                  </IconButton>
                </HStack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        {loading && (
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text fontSize="lg" color="gray.500">
              Loading products...
            </Text>
          </VStack>
        )}

        {!loading && products.length === 0 && (
          <VStack spacing={4}>
            <Text
              fontSize={"xl"}
              textAlign={"center"}
              fontWeight={"bold"}
              color={"gray.500"}
            >
              No products found 😢
            </Text>
            <Button as={RouterLink} to="/create" colorScheme="blue" size="lg">
              Create a Product
            </Button>
          </VStack>
        )}

        {/* Pagination Controls */}
        {!loading && pagination && pagination.total > 0 && (
          <VStack spacing={3} mt={8}>
            {pagination.pages > 1 && (
              <HStack spacing={2}>
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  opacity={currentPage === 1 ? 0.4 : 1}
                  cursor={currentPage === 1 ? "not-allowed" : "pointer"}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                >
                  Previous
                </Button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      colorScheme={currentPage === page ? "blue" : "gray"}
                      variant={currentPage === page ? "solid" : "outline"}
                      size="sm"
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                  opacity={currentPage === pagination.pages ? 0.4 : 1}
                  cursor={currentPage === pagination.pages ? "not-allowed" : "pointer"}
                  size="sm"
                  colorScheme="blue"
                  variant="outline"
                >
                  Next
                </Button>
              </HStack>
            )}

            {/* Pagination Info */}
            <Text fontSize="sm" color="gray.500">
              Showing {products.length} of {pagination.total} products
              {pagination.pages > 1 &&
                ` (Page ${currentPage} of ${pagination.pages})`}
            </Text>
          </VStack>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <DialogRoot
        open={deleteDialogOpen}
        onOpenChange={(e) => setDeleteDialogOpen(e.open)}
      >
        <DialogBackdrop bg="blackAlpha.600" />
        <DialogContent
          maxW="md"
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to delete "{productToDelete?.name}"? This
              action cannot be undone.
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Edit Product Dialog */}
      <DialogRoot
        open={editDialogOpen}
        onOpenChange={(e) => setEditDialogOpen(e.open)}
      >
        <DialogBackdrop bg="blackAlpha.600" />
        <DialogContent
          maxW="md"
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
        >
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <VStack spacing={4}>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Product Name
                </Text>
                <Input
                  placeholder="Product Name"
                  value={editedProduct.name}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      name: e.target.value,
                    })
                  }
                />
              </Box>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Price
                </Text>
                <Input
                  placeholder="Price"
                  type="number"
                  value={editedProduct.price}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      price: e.target.value,
                    })
                  }
                />
              </Box>
              <Box w="full">
                <Text mb={2} fontWeight="medium">
                  Image URL
                </Text>
                <Input
                  placeholder="Image URL"
                  value={editedProduct.image}
                  onChange={(e) =>
                    setEditedProduct({
                      ...editedProduct,
                      image: e.target.value,
                    })
                  }
                />
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button colorScheme="blue" onClick={handleUpdateProduct}>
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default HomePage;
