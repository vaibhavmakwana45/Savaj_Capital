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
import Loader from "react-js-loader";
import TableComponent from "TableComponent";

function Tables() {
  const [banks, setBanks] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await AxiosInstance.get("/addbankuser/banks");
        setBanks(response.data.data);
        setLoading(false)
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

  const allHeaders = ["Bank Name", "Branch Name", "City", "State", "Users", "Action"];

  const formattedData = banks.map(bank => ([
    bank.bank_id,
    bank.bank_name,
    bank.branch_name,
    bank.city,
    bank.state,
    bank.users.map(user => user.email).join(", "), // Concatenate emails of users
  ]));

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


  const handleDelete = (id) => {
    setSelectedBankId(id);
    setIsDeleteDialogOpen(true);
  }

  const handleEdit = (id) => {
    navigateToAnotherPage(id)
  }
  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Banks and Users
              </Text>
              <Button onClick={() => { navigateToAnotherPage() }} colorScheme="blue">
                Add Bank
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>

            <TableComponent
              banks={banks}
              data={formattedData}
              textColor={textColor}
              borderColor={borderColor}
              loading={loading}
              allHeaders={allHeaders}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
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
      </Flex>
      <Toaster />
    </>
  );
}

export default Tables;
