import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/react";
import { Flex, Text, useColorModeValue, Button, Input } from "@chakra-ui/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Box,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import toast, { Toaster } from "react-hot-toast";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function BankUsers() {
  const [bankUsers, setBankUsers] = useState([]);
  const [bank, setBank] = useState({});
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const menuBg = useColorModeValue("white", "navy.800");
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");

  const filteredUsers =
    searchTerm.length === 0
      ? bankUsers
      : bankUsers.filter(
          (bank) =>
            bank?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
            bank?.mobile
              ?.toString()
              ?.toLowerCase()
              ?.includes(searchTerm?.toLowerCase()) ||
            bank?.adhar
              ?.toString()
              ?.toLowerCase()
              ?.includes(searchTerm?.toLowerCase()) ||
            bank?.adress?.toLowerCase()?.includes(searchTerm?.toLowerCase())
        );

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await AxiosInstance.get("/bank_user/" + id);
        setBankUsers(response.data.data);
        setBank(response.data.bank);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bankUsers:", error);
      }
    };

    fetchBanks();
  }, []);

  const navigateToAnotherPage = (id) => {
    if (id) {
      history.push("/superadmin/addbank?id=" + id);
      return;
    }
  };

  const navigateToAnotherPageUser = (id) => {
    if (id) {
      history.push("/superadmin/addbankuser?id=" + id);
      return;
    }
  };
  const navigateToAddBank = () => {
    history.push("/superadmin/addbank");
  };
  const navigateToAddBankUser = () => {
    history.push("/superadmin/addbankuser");
  };

  const allHeaders = [
    "Index",
    "email",
    "mobile",
    "state",
    "city",
    "Assign File",
    "create",
    "update",
    "Action",
  ];

  const formattedData = filteredUsers.map((bank, index) => [
    bank.bankuser_id,
    index + 1,
    bank.email,
    bank.mobile,
    bank.state,
    bank.city,
    bank.assigned_file_count,
    bank.createdAt,
    bank.updatedAt,
  ]);

  const formattedCollapsedData = filteredUsers.map((bank) => [bank.bank_id]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const cancelRef = React.useRef();
  const deleteBank = async (bankId) => {
    try {
      const responce = await AxiosInstance.delete(
        `/bank_user/deletebankuser/${bankId}`
      );

      if (responce.data.success) {
        setIsDeleteDialogOpen(false);
        setBankUsers(bankUsers.filter((bank) => bank.bankuser_id !== bankId));
        toast.success("Bank User deleted successfully!");
      } else if (responce.data.statusCode === 201) {
        toast.error(responce.data.message);
        setIsDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error);
    }
  };

  const handleDelete = (id) => {
    setSelectedBankId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    navigateToAnotherPageUser(id);
  };

  const handleRow = (id) => {
    history.push("/superadmin/bank-assigned-file?id=" + id);
  };
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedBankUsers, setSelectedBankUsers] = useState([]);

  const handleTitle = (bankuserId) => {
    const bankUser = bankUsers.find((bank) => bank.bankuser_id === bankuserId);
    if (bankUser && bankUser.files) {
      const assignedFiles = bankUser.files.map((file) => ({
        file_id: file.file_id,
        username: file.file_details.user_details.username,
        status: file.file_details.status,
        status_color: file.file_details.status_color,
        loan: file.file_details.loan_details.loan,
      }));
      setSelectedBankUsers(assignedFiles);
      setShowUserDetails(true);
    } else {
      console.error("Bank user or files not found:", bankUser);
    }
  };

  const handleCloseTitle = () => {
    setShowUserDetails(false);
    setSelectedBankUsers([]);
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
                  className="ttext d-flex"
                >
                  {" "}
                  {bank?.bank_name || "..."}{" "}
                  {bank?.state && " - " + bank?.state + "," + bank?.city}
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
                  padding: "12px", // Padding for comfortable input
                  fontSize: "16px", // Font size
                  borderRadius: "8px", // Rounded corners
                  border: "2px solid #b19552", // Solid border with custom color
                  backgroundColor: "#ffffff", // White background
                  color: "#333333", // Text color
                  outline: "none", // Remove default outline
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Subtle box shadow
                  transition: "all 0.3s ease-in-out", // Smooth transitions
                  fontFamily: "inherit", // Inherit default font family
                }}
              />

              <Button
                onClick={navigateToAddBank}
                colorScheme="blue"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                  marginRight: "10px",
                }}
              >
                Add Bank
              </Button>
              <Button
                onClick={navigateToAddBankUser}
                colorScheme="blue"
                style={{
                  backgroundColor: "#b19552",
                  color: "#fff",
                }}
              >
                Add Bank User
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            {/* <TableComponent
              bankUsers={bankUsers}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              handleRow={handleRow}
            /> */}
            <TableComponent
              // documents={documents}
              bankUsers={bankUsers}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleRow={handleRow}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              collapse={true}
              removeIndex={6}
              removeIndex2={7}
              documentIndex={7}
              documentIndex2={8}
              name={"Created At:"}
              name2={"Updated At:"}
              showPagination={true}
              handleTitle={handleTitle}
              showTitleButton={true}
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
                  onClick={() => deleteBank(selectedBankId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
        <Flex direction="column" alignItems="center" p={4}>
          <Modal isOpen={showUserDetails} onClose={handleCloseTitle} size="3xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Assigned Files</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box maxHeight="500px" overflowY="auto">
                  {selectedBankUsers.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>File ID</Th>
                          <Th>Loan</Th>
                          <Th>Username</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedBankUsers.map((file, index) => (
                          <Tr key={index}>
                            <Td>{file.file_id}</Td>
                            <Td>{file.loan}</Td>
                            <Td>{file.username || "N/A"}</Td>
                            <Td>
                              <Text color={file.status_color || "black"}>
                                {file.status || "N/A"}
                              </Text>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text>No files assigned to this user.</Text>
                  )}
                </Box>
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={handleCloseTitle}
                  bg="#b19552"
                  color="white"
                  _hover={{ bg: "#a58447" }}
                >
                  Close
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Flex>
      </Flex>
      <Toaster />
    </>
  );
}

export default BankUsers;
