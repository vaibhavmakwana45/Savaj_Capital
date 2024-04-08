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

function Tables() {
  const [banks, setBanks] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await AxiosInstance.get("/addbankuser/banks");
        setBanks(response.data.data);
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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const cancelRef = React.useRef();
  const deleteBank = async (bankId) => {
    try {
      await AxiosInstance.delete(`/addbankuser/deletebanks/${bankId}`);
      setBanks(banks.filter((bank) => bank.bank_id !== bankId));
      setIsDeleteDialogOpen(false);
      toast.success("Bank deleted successfully!");
    } catch (error) {
      console.error("Error deleting bank:", error);
      toast.error("bank not delete");
    }
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Banks and Users
              </Text>
              <Button
                onClick={() => {
                  navigateToAnotherPage();
                }}
                colorScheme="blue"
              >
                Add Bank
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <Table variant="simple" color={textColor}>
              <Thead>
                <Tr my=".8rem" pl="0px" color="gray.400">
                  <Th pl="0px" borderColor={borderColor} color="gray.400">
                    Bank Name
                  </Th>
                  <Th pl="0px" borderColor={borderColor} color="gray.400">
                    Branch Name
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    City
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    State
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Users
                  </Th>
                  <Th borderColor={borderColor} color="gray.400">
                    Action
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {banks.map((bank) => (
                  <Tr key={bank._id}>
                    <Td pl="0px">{bank.bank_name}</Td>
                    <Td pl="0px">{bank.branch_name}</Td>
                    <Td>{bank.city}</Td>
                    <Td>{bank.state}</Td>
                    <Td>{bank.users.map((user) => user.email).join(", ")}</Td>
                    <Td>
                      <div>
                        <IconButton
                          aria-label="Delete bank"
                          icon={<DeleteIcon />}
                          onClick={() => {
                            setSelectedBankId(bank.bank_id);
                            setIsDeleteDialogOpen(true);
                          }}
                          style={{ marginRight: 15 }}
                        />
                        <IconButton
                          aria-label="Edit bank"
                          icon={<EditIcon />}
                          onClick={() => {
                            navigateToAnotherPage(bank.bank_id);
                          }}
                        />
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
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
      </Flex>
      <Toaster />
    </>
  );
}

export default Tables;
