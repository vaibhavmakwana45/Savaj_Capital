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
import { DeleteIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { EditIcon } from "@chakra-ui/icons";
import AxiosInstance from "config/AxiosInstance";

function SavajCapitalBranchTable() {
  const [savajcapitalbranch, setSavajcapitalbranch] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await AxiosInstance.get(
          "/addsavajbapitalbranch/allsavajcapitalbranch"
        );
        setSavajcapitalbranch(response.data.data);
        console.log("first", response.data.data);
      } catch (error) {
        console.error("Error fetching savajcapitalbranch:", error);
      }
    };

    fetchBanks();
  }, []);

  const navigateToAnotherPage = () => {
    history.push("/superadmin/addsavajcapitalbranch");
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const cancelRef = React.useRef();
  const deletebranch = async (branchId) => {
    try {
      await AxiosInstance.delete(
        `/addsavajbapitalbranch/deletebranch/${branchId}`
      );
      setSavajcapitalbranch(
        savajcapitalbranch.filter(
          (branch) => branch.savajcapitalbranch_id !== branchId
        )
      );
      setIsDeleteDialogOpen(false);
      toast.success("Branch deleted successfully!");
    } catch (error) {
      console.error("Error deleting branch:", error);
      toast.error("branch not delete");
    }
  };
  const navigateToEditPage = (branchId) => {
    history.push(`/superadmin/editsavajcapitalbranch/${branchId}`);
  };

  return (
    <>
      <Flex direction="column" pt={{ base: "120px", md: "75px" }}>
        <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb="0px">
          <CardHeader p="6px 0px 22px 0px">
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontSize="xl" color={textColor} fontWeight="bold">
                Savaj Capital Branch User
              </Text>
              <Button onClick={navigateToAnotherPage} colorScheme="blue">
                Add
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <Table variant="simple" color={textColor}>
              <Thead>
                <Tr my=".8rem" pl="0px" color="gray.400">
                  <Th pl="0px" borderColor={borderColor} color="gray.400">
                    Savaj Capital Branch
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
                {savajcapitalbranch.map((savajcapitalbranch) => (
                  <Tr key={savajcapitalbranch.savajcapitalbranch_id}>
                    <Td pl="0px">
                      {savajcapitalbranch.savajcapitalbranch_name}
                    </Td>
                    <Td>{savajcapitalbranch.city}</Td>
                    <Td>{savajcapitalbranch.state}</Td>
                    <Td>
                      {savajcapitalbranch.users
                        .map((user) => user.email)
                        .join(", ")}
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="Delete branch"
                        icon={<DeleteIcon />}
                        onClick={() => {
                          setSelectedBranchId(
                            savajcapitalbranch.savajcapitalbranch_id
                          );
                          setIsDeleteDialogOpen(true);
                        }}
                      />
                      <IconButton
                        aria-label="Edit branch"
                        icon={<EditIcon />}
                        onClick={() =>
                          navigateToEditPage(
                            savajcapitalbranch.savajcapitalbranch_id
                          )
                        }
                      />
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
                Delete Branch
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
                  onClick={() => deletebranch(selectedBranchId)}
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

export default SavajCapitalBranchTable;
