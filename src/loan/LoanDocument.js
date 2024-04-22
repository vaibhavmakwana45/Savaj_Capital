// Add axios to your imports
import axios from "axios";
import {
  Flex,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  useColorModeValue,
  FormControl,
  Button,
} from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Input,
} from "@chakra-ui/react";
import toast, { Toaster } from "react-hot-toast";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import { RocketIcon } from "components/Icons/Icons";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function LoanDocument() {
  const [document, setDocument] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const [selectedDocument, setSelectedDocument] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [isEditDocument, setisEditDocument] = useState(false);

  const fetchDocument = async () => {
    try {
      const response = await AxiosInstance.get("/loan_docs/" + id);
      setDocument(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching document:", error);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, []);

  const filteredUsers =
    searchTerm.length === 0
      ? document
      : document.filter((user) =>
          user.loan_document.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = ["Loan Document", "Created At", "Updated At", "Action"];
  const formattedData = filteredUsers?.map((item) => [
    item.loan_document_id,
    item.loan_document,
    item.createdAt,
    item.updatedAt,
  ]);

  const handleDelete = (id) => {
    setSelectedUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    setisEditDocument(true);
    setSelectedDocumentId(id);
    const data = document.find((user) => user.loan_document_id == id);
    if (data) {
      setSelectedDocument(data.loan_document);
    } else {
      console.error("Data not found for id:", id);
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const cancelRef = React.useRef();

  const deletebranch = async (documentId) => {
    try {
      const response = await AxiosInstance.delete(`/loan_docs/${documentId}`);
      setDocument(
        document.filter((user) => user.loan_document_id !== documentId)
      );
      setIsDeleteDialogOpen(false);
      toast.success("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("user not delete");
    }
  };

  const AddDocument = async (loan_document) => {
    try {
      const response = await AxiosInstance.post("/loan_docs/", {
        loan_document: [loan_document], // Modify this line if necessary
        loantype_id: id,
      });
      console.log("response", response);
      if (response.data.success) {
        toast.success("Document Added successfully!");
        setisEditDocument(false);
        setSelectedDocument("");
        fetchDocument();
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
        toast.success("Document Name Updated successfully!");
        setisEditDocument(false);
        setSelectedDocument("");
        fetchDocument();
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

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                {document[0]?.loan_type || "..."}
              </Text>
              <Flex>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                <Button
                  onClick={() => setisEditDocument(true)}
                  colorScheme="blue"
                >
                  Add Document
                </Button>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              //   handleRow={handleRow}
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
                Delete User
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
                  onClick={() => deletebranch(selectedUserId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* edit */}
        <AlertDialog
          isOpen={isEditDocument}
          leastDestructiveRef={cancelRef}
          onClose={() => {
            setisEditDocument(false);
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
                    setisEditDocument(false);
                    setSelectedDocument("");
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
                >
                  {selectedDocumentId != "" ? "Updated Now" : "Add Now"}
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

export default LoanDocument;
