import {
  Flex,
  Text,
  useColorModeValue,
  Button,
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
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import AxiosInstance from "config/AxiosInstance";
import TableComponent from "TableComponent";

function Tables() {
  const [banks, setBanks] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  let menuBg = useColorModeValue("white", "navy.800");

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
    history.push("/superadmin/addbank");
  };

  const navigateToAnotherPageUser = (id) => {
    if (id) {
      history.push("/superadmin/addbankuser?id=" + id);
      return;
    }
    history.push("/superadmin/addbankuser");
  };

  const navigateToAssignFile = () => {
    history.push("/superadmin/bankassignfile");
  };

  const allHeaders = [
    "Index",
    "Bank Name",
    "Branch Name",
    "City",
    "State",
    "users",
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

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" className="thead">
              <Text
                fontSize="xl"
                color={textColor}
                fontWeight="bold"
                className="ttext"
              >
                Banks
              </Text>
              <div className="thead">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name"
                  width="250px"
                  marginRight="10px"
                />
                {/* <Button
                  onClick={navigateToAnotherPage}
                  colorScheme="blue"
                  style={{ marginRight: "10px", marginBottom: "10px" }}
                >
                  Add Bank
                </Button>{" "} */}
                {/* <Button
                  onClick={navigateToAnotherPageUser}
                  colorScheme="blue"
                  style={{ marginRight: "10px", marginBottom: "10px" }}
                >
                  Add Bank User
                </Button> */}
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
              </div>
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
              removeIndex={6}
              removeIndex2={7}
              documentIndex={7}
              documentIndex2={8}
              name={"Created At:"}
              name2={"Updated At:"}
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
                  onClick={() => deleteBankUser(selectedBankUserId)}
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

export default Tables;
