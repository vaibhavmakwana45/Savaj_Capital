import {
  Flex,
  Text,
  useColorModeValue,
  Button,
  Input,
  Box,
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
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function BankTable() {
  const [banks, setBanks] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  let menuBg = useColorModeValue("white", "navy.800");
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedBankUsers, setSelectedBankUsers] = useState([]);

  const filteredUsers =
    searchTerm.length === 0
      ? banks
      : banks.filter(
          (bank) =>
            bank.bank_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bank.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bank.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bank.state.toLowerCase().includes(searchTerm.toLowerCase())
        );

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await AxiosInstance.get("/addbankuser");
        setBanks(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching banks:", error);
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

  const navigateToAssignFile = () => {
    history.push("/superadmin/bankassignfile");
  };
  const navigateToAddBank = () => {
    history.push("/superadmin/addbank");
  };
  const navigateToAddBankUser = () => {
    history.push("/superadmin/addbankuser");
  };
  const allHeaders = [
    "Index",
    "Bank Name",
    "Branch Name",
    "City",
    "State",
    "users",
    "files",
    "create",
    "update",
    "Action",
  ];

  const formattedData = filteredUsers.map((bank, index) => [
    bank.bank_id,
    index + 1,
    bank.bank_name,
    bank.branch_name,
    bank.city,
    bank.state,
    bank?.user_count,
    bank?.file_count,
    bank.createdAt,
    bank.updatedAt,
  ]);

  const formattedCollapsedData = filteredUsers.map((bank) => [bank.bank_id]);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedBankUserId, setSelectedBankUserId] = useState(null);
  const cancelRef = React.useRef();
  const deleteBankUser = async (bankId) => {
    try {
      const response = await AxiosInstance.delete(`/bank_user/${bankId}`);

      if (response.data.success) {
        setIsDeleteDialogOpen(false);
        toast.success("Bank deleted successfully!");
        setBanks(banks.filter((bank) => bank.bank_id !== bankId));
      } else if (response.data.statusCode === 201) {
        setIsDeleteDialogOpen(false);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error(error);
    }
  };

  const handleDelete = (id) => {
    setSelectedBankUserId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleEdit = (id) => {
    navigateToAnotherPage(id);
  };

  const handleRow = (id) => {
    history.push("/superadmin/bankusers?id=" + id);
  };

  const handleTitle = (rowData) => {
    const bank = banks.find((bank) => bank.bank_id === rowData);
    if (bank && bank.users) {
      setSelectedBankUsers(bank.users);
      setShowUserDetails(true);
    } else {
      console.error("Bank or users not found:", bank);
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
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="2xl"
                fontWeight="bold"
                bgGradient="linear(to-r, #b19552, #212529)"
                bgClip="text"
                className="ttext"
              >
                Banks
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
                  padding: "10px", // Padding for comfortable input
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
              {/* <Menu>
                  <MenuButton>
                    <Button
                      onClick={navigateToAnotherPage}
                      colorScheme="blue"
                      style={{ marginRight: "10px",marginBottom:"10px" }}
                    >
                      ...
                    </Button>
                  </MenuButton>

                  <Button onClick={navigateToAssignFile} colorScheme="blue">
                    Assign File
                  </Button>
                  <MenuList p="16px 8px" bg={menuBg} mt="10px">
                    <Flex flexDirection="column" style={{ gap: 10 }}>
                      <MenuItem
                        borderRadius="8px"
                        onClick={() => {
                          navigateToAnotherPage();
                        }}
                      >
                        <Flex align="center" justifyContent="flex-start">
                          Add Bank
                        </Flex>
                      </MenuItem>
                      <MenuItem
                        borderRadius="8px"
                        onClick={() => {
                          navigateToAnotherPageUser();
                        }}
                      >
                        <Flex align="center" justifyContent="flex-start">
                          Add Bank User
                        </Flex>
                      </MenuItem>
                    </Flex>
                  </MenuList>
                </Menu> */}
            </Flex>
          </CardHeader>
          <CardBody>
            {/* <TableComponent
              banks={banks}
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
              banks={banks}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleRow={handleRow}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
              collapse={true}
              removeIndex={7}
              removeIndex2={8}
              documentIndex={8}
              documentIndex2={9}
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
                  onClick={() => deleteBankUser(selectedBankUserId)}
                  ml={3}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
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
                    onClick={() => deleteBankUser(selectedBankUserId)}
                    ml={3}
                  >
                    Delete
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        </AlertDialog>
        <Flex direction="column" alignItems="center" p={4}>
          <Modal isOpen={showUserDetails} onClose={handleCloseTitle} size="5xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader color="black" py={4}>
                Bank Users
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Box maxHeight="500px" overflowY="auto">
                  {selectedBankUsers.length === 0 ? (
                    <Text
                      fontWeight="bold"
                      fontSize="xl"
                      color="#b19552"
                      textAlign="center"
                    >
                      No users available
                    </Text>
                  ) : (
                    selectedBankUsers.map((user) => (
                      <Box
                        key={user._id}
                        p={6}
                        mb={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        boxShadow="md"
                        bg="white"
                        transition="transform 0.2s"
                      >
                        <Text
                          fontWeight="bold"
                          fontSize="xl"
                          mb={2}
                          color="#b19552"
                        >
                          {user.bankuser_name}
                        </Text>
                        <Text mb={1}>
                          <strong>Email:</strong> {user.email}
                        </Text>
                        <Text mb={1}>
                          <strong>City:</strong> {user.city}
                        </Text>
                        <Text mb={1}>
                          <strong>State:</strong> {user.state}
                        </Text>
                        <Text mb={1}>
                          <strong>Mobile:</strong> {user.mobile}
                        </Text>
                        {user.files && user.files.length > 0 && (
                          <>
                            <Text
                              fontWeight="bold"
                              mt={4}
                              mb={2}
                              color="#b19552"
                            >
                              Assigned Files:
                            </Text>
                            <Table variant="simple" size="sm">
                              <Thead bg="gray.200">
                                <Tr>
                                  <Th>File ID</Th>
                                  <Th>Username</Th>
                                  <Th>Loan</Th>
                                  <Th>Status</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {user.files.map((file) => (
                                  <Tr key={file.file_id}>
                                    <Td>{file.file_id}</Td>
                                    <Td>
                                      {file.file_details.user_details.username}
                                    </Td>
                                    <Td>
                                      {file.file_details.loan_details.loan}
                                    </Td>
                                    <Td>
                                      <Text
                                        color={file.file_details.status_color}
                                      >
                                        {file.file_details.status}
                                      </Text>
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </>
                        )}
                      </Box>
                    ))
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

export default BankTable;
