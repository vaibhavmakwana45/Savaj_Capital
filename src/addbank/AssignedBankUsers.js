import { Flex, Text, useColorModeValue, Button } from "@chakra-ui/react";
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
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function AssignedBankUsers() {
  const [bankUserAssignedFile, setBankUserAssignedFile] = useState([]);
  const [bankUserName, setBankUserName] = useState("");
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await AxiosInstance.get(
          `/bank_user/assigned_file/${id}`
        );
        setBankUserAssignedFile(response.data.data);
        setBankUserName(response?.data?.bankUserData?.bankuser_name);
        setLoading(false);
      } catch (error) {
        setLoading(false);

        console.error("Error fetching bankUserAssignedFile:", error);
      }
    };

    fetchUsers();
  }, []);

  const navigateToAnotherPage = () => {
    history.push("/superadmin/adduser");
  };

  const filteredUsers =
    searchTerm.length === 0
      ? bankUserAssignedFile
      : bankUserAssignedFile.filter(
          (user) =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.number.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const allHeaders = [
    "Index",
    "File Id",
    "User Name",
    "Loan",
    "Loan Type",
    "CreatedAt",
    "UpdatedAt",
    "Action",
  ];
  const formattedData = filteredUsers?.map((item, index) => [
    item?.file_id,
    index + 1,
    item?.file_id,
    item?.username,
    item?.loan,
    item?.loan_type,
    item?.file_data.createdAt,
    item?.file_data.updatedAt,
  ]);

  const handleRow = (id) => {};

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bankUserAssignedFileId, setBankUserAssignedFileId] = useState(null);

  const cancelRef = React.useRef();
  const deleteBankUser = async (file_id) => {
    try {
      const response = await AxiosInstance.delete(
        `/bank_user/assigedfile_delete/${file_id}`
      );

      if (response.data.success) {
        setIsDeleteDialogOpen(false);
        toast.success("Bank deleted successfully!");
        setBankUserAssignedFile(
          bankUserAssignedFile.filter(
            (savajUserFileAssign) => savajUserFileAssign.file_id !== file_id
          )
        );
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error);
    }
  };

  const handleDelete = (file_id) => {
    setBankUserAssignedFileId(file_id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #b19552, #212529)"
                bgClip="text"
                className="ttext"
              >
                {bankUserName ? bankUserName + "'s -" : ""} Assigned File
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <TableComponent
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              showDeleteButton={true}
              showEditButton={false}
              handleDelete={handleDelete}
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
                Delete Bank
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
                  onClick={() => deleteBankUser(bankUserAssignedFileId)}
                  ml={3}
                >
                  Delete
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

export default AssignedBankUsers;
