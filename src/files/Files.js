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
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import TablesTableRow from "components/Tables/TablesTableRow";
import { RocketIcon } from "components/Icons/Icons";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function Files() {
  const [files, setFiles] = useState([]);
  console.log(files, "files");
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AxiosInstance.get("/file_uplode");
        setFiles(response.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);

        console.error("Error fetching files:", error);
      }
    };

    fetchUsers();
  }, []);

  const navigateToAnotherPage = () => {
    history.push("/superadmin/adduser");
  };

  const filteredUsers =
    searchTerm.length === 0
      ? files
      : files.filter(
          (user) =>
            user.loan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.loan.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.number.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = [
    "File Id",
    "Loan",
    "Loan Type",
    "CreatedAt",
    "UpdatedAt",
    "Action",
  ];
  const formattedData = filteredUsers.map((item) => [
    item.file_id,
    item.loan_id,
    item.loan,
    item.loan_type,
    item.createdAt,
    item.updatedAt,
  ]);
  console.log(formattedData, "formattedData");

  const handleEdit = (id) => {
    history.push("/superadmin/editfile?id=" + id);
  };

  const handleRow = (id) => {
    history.push("/superadmin/viewfile?id=" + id);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const cancelRef = React.useRef();
  const deletefile = async (fileId) => {
    try {
      await AxiosInstance.delete(`/file_uplode/${fileId}`);
      setFiles(files.filter((file) => file.file_id !== fileId));
      setIsDeleteDialogOpen(false);
      toast.success("File deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("file not delete");
    }
  };
  const handleDelete = (id) => {
    setSelectedFileId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                All Files
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
                  onClick={() => history.push("/superadmin/addfile")}
                  colorScheme="blue"
                >
                  Add Files
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
              handleRow={handleRow}
            />
          </CardBody>
        </Card>
      </Flex>
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete File
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
                onClick={() => deletefile(selectedFileId)}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <Toaster />
    </>
  );
}

export default Files;
