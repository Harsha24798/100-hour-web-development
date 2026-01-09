import {
  Box,
  Button,
  Container,
  DialogActionTrigger,
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
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useProductsStore } from "../store/product";
import { toaster } from "@/components/ui/toaster";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

const HomePage = () => {
  const { products, fetchProducts, deleteProduct, updateProduct } =
    useProductsStore();
  const [editingId, setEditingId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const bg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.200");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      const { success, message } = await deleteProduct(productToDelete._id);
      toaster.create({
        title: success ? "Success" : "Error",
        description: message,
        type: success ? "success" : "error",
        duration: 3000,
      });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setEditedProduct({
      name: product.name,
      price: product.price,
      image: product.image,
    });
  };

  const handleUpdateProduct = async (pid) => {
    const { success, message } = await updateProduct(pid, editedProduct);
    toaster.create({
      title: success ? "Success" : "Error",
      description: message,
      type: success ? "success" : "error",
      duration: 3000,
    });
    if (success) {
      setEditingId(null);
      setEditedProduct({});
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
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
                {editingId === product._id ? (
                  <VStack spacing={3}>
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
                  </VStack>
                ) : (
                  <>
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
                  </>
                )}

                <HStack spacing={2} mt={3}>
                  {editingId === product._id ? (
                    <>
                      <IconButton
                        colorScheme="green"
                        onClick={() => handleUpdateProduct(product._id)}
                        size="sm"
                      >
                        <FiCheck />
                      </IconButton>
                      <IconButton
                        colorScheme="gray"
                        onClick={handleCancelEdit}
                        size="sm"
                      >
                        <FiX />
                      </IconButton>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </HStack>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        {products.length === 0 && (
          <Text
            fontSize={"xl"}
            textAlign={"center"}
            fontWeight={"bold"}
            color={"gray.500"}
          >
            No products found 😢{" "}
            <Text
              as={"span"}
              color={"blue.500"}
              _hover={{ textDecoration: "underline" }}
            >
              Create a product
            </Text>
          </Text>
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <DialogRoot
        open={deleteDialogOpen}
        onOpenChange={(e) => setDeleteDialogOpen(e.open)}
      >
        <DialogContent>
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
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Container>
  );
};

export default HomePage;
