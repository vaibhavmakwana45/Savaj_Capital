import {
  Button,
  Flex,
  FormControl,
  Text,
  useColorModeValue,
  Input,
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";
import axios from "axios";

function AddAllDocuments() {
  const [documents, setDocuments] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocumetId, setSelectedDocumetId] = useState("");
  const [selectedDocument, setSelectedDocument] = useState("");

  const getDocumentData = async () => {
    try {
      const response = await AxiosInstance.get("/document");
      if (response.data.success) {
        setDocuments(response.data.data);
        setLoading(false);
      } else if (response.data.statusCode === 201) {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  const fllteredDocument =
    searchTerm.length === 0
      ? documents
      : documents.filter((doc) =>
          doc.document.toLowerCase().includes(searchTerm.toLowerCase())
        );
  useEffect(() => {
    getDocumentData();
  }, []);

  const allHeaders = [
    "Index",
    "Document",
    "create date",
    "update date",
    "Action",
  ];

  const formattedData = fllteredDocument.map((bank, index) => [
    bank.document_id,
    index + 1,
    bank.document,
    bank.createdAt,
    bank.updatedAt,
  ]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDocument, setIsDocument] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const cancelRef = React.useRef();
  const deleteDocument = async (documentId) => {
    try {
      const response = await AxiosInstance.delete(`/document/${documentId}`);
      getDocumentData();
      setIsDeleteDialogOpen(false);
      if (response.data.success) {
        toast.success("Document deleted successfully!");
      } else if (response.data.statusCode === 201) {
        toast.error(response.data.message);
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error);
    }
  };

  const handleDelete = (id) => {
    setSelectedDocumentId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setSelectedDocumetId(id);
    setIsDocument(true);
    const doc = documents.find((doc) => doc.document_id === id);
    if (doc) {
      setSelectedDocument(doc.document);
    } else {
      console.error("Document not found for id:", id);
    }
  };

  const handleRow = (id) => {};

  const handleAddDocument = async (document) => {
    try {
      const response = await AxiosInstance.post("/document", { document });
      if (response.data.success) {
        toast.success("Document added successfully!");
        setIsDocument(false);
        setSelectedDocumetId("");
        getDocumentData();
        setDocument("");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const editDocument = async (document) => {
    try {
      const response = await AxiosInstance.put(
        "/document/" + selectedDocumetId,
        {
          document,
        }
      );

      if (response.data.success) {
        toast.success("Document Updated successfully!");
        setIsDocument(false);
        setSelectedDocumetId("");
        getDocumentData();
        setDocument("");
      } else {
        toast.error(response.data.message || "Please try again later!");
      }
    } catch (error) {
      console.error("Submission error", error);
      toast.error("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex
              justifyContent="space-between"
              alignItems="center"
              className="thead"
            >
              <Text
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #b19552, #212529)"
                bgClip="text"
                className="ttext"
              >
                All Documents
              </Text>
            </Flex>
            <Flex justifyContent="end">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                width="250px"
                marginRight="10px"
                style={{
                  padding: "12px", // Increased padding for comfort
                  fontSize: "16px", // Font size
                  borderRadius: "8px", // Rounded corners
                  border: "2px solid #b19552", // Solid border with custom color
                  backgroundColor: "#ffffff", // White background
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle box shadow
                  color: "#333333", // Text color
                  outline: "none", // Remove default outline
                  transition: "all 0.3s ease-in-out", // Smooth transitions
                  fontFamily: "inherit", // Inherit default font family
                }}
              />

              <Button
                onClick={() => {
                  setIsDocument(true);
                }}
                colorScheme="blue"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                }}
              >
                Add Documents
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              documents={documents}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleRow={handleRow}
              showPagination={true}
            />
          </CardBody>
        </Card>
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDeleteDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete Document
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure? You can't undo this action afterwards.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={() => deleteDocument(selectedDocumentId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <AlertDialog
          isOpen={isDocument}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsDocument(false);
            setSelectedDocumetId("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Add Document
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="document" isRequired>
                  <Input
                    name="document"
                    onChange={(e) => {
                      selectedDocumetId == ""
                        ? setDocument(e.target.value)
                        : setSelectedDocument(e.target.value);
                    }}
                    value={
                      selectedDocumetId == "" ? document : selectedDocument
                    }
                    placeholder="Add document"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (selectedDocumetId) {
                          editDocument(selectedDocument);
                        } else {
                          handleAddDocument(document);
                        }
                      }
                    }}
                  />
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setIsDocument(false);
                    setSelectedDocumetId("");
                  }}
                  style={{
                    backgroundColor: "#414650",
                    border: "2px solid #b19552",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    if (selectedDocumetId) {
                      editDocument(selectedDocument);
                    } else {
                      handleAddDocument(document);
                    }
                  }}
                  ml={3}
                  type="submit"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {selectedDocumetId ? "Update Now" : "Add Now"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Flex>
      <Toaster />
    </>
  );
}

export default AddAllDocuments;
