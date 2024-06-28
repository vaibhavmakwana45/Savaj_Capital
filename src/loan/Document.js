import React, { useEffect, useState } from "react";
import { Flex, Text, useColorModeValue, Button } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Input,
  FormControl,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TableComponent from "TableComponent";
import AxiosInstance from "config/AxiosInstance";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useHistory, useLocation } from "react-router-dom";

function Document() {
  const location = useLocation();
  const history = useHistory();
  const { loan_id, loantype_id } = location?.state?.state || {};
  const [documents, setDocuments] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDocument, setIsEditDocument] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLoanDocumentId, setSelctedDocumentId] = useState(null);
  const cancelRef = React.useRef();
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [inputIndex, setInputIndex] = useState("");

  const openTitleModal = (documentId) => {
    setSelectedDocumentId(documentId);
    setIsTitleModalOpen(true);
  };

  const updateDocumentIndex = async (documentId, newIndex) => {
    try {
      const response = await AxiosInstance.put(
        `/loan_docs/update-index/${documentId}`,
        {
          newIndex,
        }
      );
      if (response.data.success) {
        toast.success("Index updated successfully!");
        fetchDocuments();
        setDocuments((prevDocs) =>
          prevDocs.map((doc) =>
            doc.loan_document_id === documentId
              ? { ...doc, index: newIndex }
              : doc
          )
        );
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating document index:", error);
      toast.error(
        error.response?.data.message ||
          error.message ||
          "Error updating index. Please try again."
      );
    }
  };

  const handleInputIndexSubmit = () => {
    if (inputIndex.trim() !== "" && !isNaN(inputIndex) && selectedDocumentId) {
      updateDocumentIndex(selectedDocumentId, parseInt(inputIndex, 10));
      setIsTitleModalOpen(false);
      setInputIndex("");
    } else {
      toast({
        title: "Invalid input",
        description: "Invalid index or no document selected.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTitle = (rowData) => {
    openTitleModal(rowData);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const url = loantype_id
        ? `/loan_docs/documents/${loan_id}/${loantype_id}`
        : `/loan_docs/${loan_id}`;
      const response = await AxiosInstance.get(url);
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to fetch documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [loan_id, loantype_id]);

  const allHeadersWithoutDocNames = [
    "Index",
    "Title",
    "Document Name",
    "createdAt",
    "updatedAt",
    "Action",
  ];

  const filteredDocuments = documents.filter(
    (doc) =>
      doc?.title && doc?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedDataWithoutDocNames = filteredDocuments.map((doc) => [
    doc.loan_document_id,
    doc.index,
    doc.title,
    doc.document_names.join(", "),
    doc.createdAt,
    doc.updatedAt,
  ]);

  const handleDelete = (id) => {
    setSelctedDocumentId(id);
    setIsDeleteDialogOpen(true);
  };

  // const handleEdit = (id) => {
  //   setIsEditDocument(true);
  //   setSelectedDocumentId(id);
  //   const data = documents.find((document) => document.loan_document_id == id);
  //   if (data) {
  //     setSelectedDocument(data.loan_document);
  //   } else {
  //     console.error("Data not found for id:", id);
  //   }
  // };

  const handleEdit = (id) => {
    history.push(`/superadmin/editloandocs?id=${id}`);
  };
  // const handleTitle = (rowData) => {
  // };

  // const deleteDocument = async (loanDocumentId) => {
  //   try {
  //     const response = await AxiosInstance.delete(
  //       `/loan_docs/${loanDocumentId}`
  //     );
  //     if (response.data.success) {
  //       setDocuments(
  //         documents.filter(
  //           (document) => document.loan_document_id !== loanDocumentId
  //         )
  //       );
  //       toast.success("Document deleted successfully!");
  //     } else {
  //       toast.error(response.data.message || "Please try again later!");
  //     }
  //     setIsDeleteDialogOpen(false);
  //   } catch (error) {
  //     console.error("Error deleting document:", error);
  //     toast.error("document not delete");
  //   }
  // };
  const deleteDocument = async (loanDocumentId) => {
    try {
      const requestData = { loan_id: loan_id }; // Always include loan_id

      // Add loantype_id to the request data if available
      if (loantype_id) {
        requestData.loantype_id = loantype_id;
      }

      const response = await AxiosInstance.delete(
        `/loan_docs/${loanDocumentId}`,
        {
          data: requestData,
        }
      );

      if (response.data.success) {
        setDocuments(
          documents.filter(
            (document) => document.loan_document_id !== loanDocumentId
          )
        );
        toast.success("Document deleted successfully!");
      } else {
        toast.error(
          response.data.message ||
            "An unexpected error occurred while deleting the document."
        );
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      if (error.response) {
        toast.error(
          error.response.data.message || "Document not deleted due to an error."
        );
      } else {
        toast.error("Network error or no response received.");
      }
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const AddDocument = async (loan_document) => {
    try {
      const response = await AxiosInstance.post("/loan_docs/", {
        loan_document: [loan_document],
        loantype_id: loantype_id,
        loan_id: loan_id,
      });
      if (response.data.success) {
        toast.success("Document Added successfully!");
        setIsEditDocument(false);
        setSelectedDocument("");
        fetchDocuments();
        setSelectedDocumentId("");
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

  const editDocument = async (loan_document) => {
    try {
      const response = await AxiosInstance.put(
        "/loan_docs/" + selectedDocumentId,
        {
          loan_document,
        }
      );

      if (response.data.success) {
        toast.success("Document Updated successfully!");
        setIsEditDocument(false);
        setSelectedDocument("");
        fetchDocuments();
        setSelectedDocumentId("");
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

  const handleRow = () => {};
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
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext d-flex"
              >
                <IconButton
                  icon={<ArrowBackIcon />}
                  onClick={() => history.goBack()}
                  aria-label="Back"
                  mr="4"
                />
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  bgGradient="linear(to-r, #b19552, #212529)"
                  bgClip="text"
                  className="ttext"
                >
                  {" "}
                  Documents
                </Text>
              </Text>
            </Flex>
            <Flex className="thead" justifyContent="end">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                width="250px"
                marginRight="10px"
                style={{
                  padding: "10px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  border: "2px solid #b19552",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  color: "#333333",
                  outline: "none",
                  transition: "all 0.3s ease-in-out",
                }}
              />

              <Button
                className="add-doc-button"
                onClick={() => history.push("/superadmin/addloandocs")}
                colorScheme="blue"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                }}
              >
                Add Document
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              documents={documents}
              data={formattedDataWithoutDocNames}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeadersWithoutDocNames}
              handleRow={handleRow}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleTitle={handleTitle}
              collapse={true}
              showTitleButton={true}
              documentIndex={3}
              removeIndex={2}
              name={"Document Names:"}
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
                  onClick={() => deleteDocument(selectedLoanDocumentId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        <AlertDialog
          isOpen={isEditDocument}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setIsEditDocument(false);
            setSelectedDocument("");
          }}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {selectedDocumentId != "" ? "Edit Document" : "Add Document"}
              </AlertDialogHeader>

              <AlertDialogBody>
                <FormControl id="loan_document" isRequired>
                  <Input
                    name="loan_document"
                    onChange={(e) => {
                      setSelectedDocument(e.target.value);
                    }}
                    value={selectedDocument}
                    placeholder={
                      selectedDocumentId != ""
                        ? "Edit Document"
                        : "Add Document"
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        selectedDocumentId != ""
                          ? editDocument(selectedDocument)
                          : AddDocument(selectedDocument);
                      }
                    }}
                  />
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => {
                    setIsEditDocument(false);
                    setSelectedDocument("");
                    setSelectedDocumentId("");
                  }}
                  style={{
                    backgroundColor: "#414650",
                    color: "#fff",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="blue"
                  onClick={() => {
                    if (selectedDocumentId !== "") {
                      editDocument(selectedDocument);
                    } else {
                      AddDocument(selectedDocument);
                    }
                  }}
                  ml={3}
                  type="submit"
                  style={{
                    backgroundColor: "#b19552",
                    color: "#fff",
                  }}
                >
                  {selectedDocumentId != "" ? "Updated Now" : "Add Now"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <Modal
          isOpen={isTitleModalOpen}
          onClose={() => setIsTitleModalOpen(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add an Index</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <Input
                  value={inputIndex}
                  onChange={(e) => setInputIndex(e.target.value)}
                  placeholder="Enter index"
                  type="number" // Ensure only numbers can be entered
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleInputIndexSubmit}
                style={{ backgroundColor: "#b19552" }}
              >
                Submit
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsTitleModalOpen(false)}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
      <Toaster />
    </>
  );
}

export default Document;
