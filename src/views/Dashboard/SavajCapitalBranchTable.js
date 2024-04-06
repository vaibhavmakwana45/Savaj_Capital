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
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Card from "components/Card/Card.js";
import CardBody from "components/Card/CardBody.js";
import CardHeader from "components/Card/CardHeader.js";
import { EditIcon } from '@chakra-ui/icons';

function SavajCapitalBranchTable() {
  const [savajcapitalbranch, setSavajcapitalbranch] = useState([]);
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const history = useHistory();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get(
          "http://localhost:4000/api/addsavajbapitalbranch/allsavajcapitalbranch"
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

  const navigateToEditPage = (branchId) => {
    history.push(`/superadmin/editsavajcapitalbranch/${branchId}`);
  };
  return (
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
                  <Td pl="0px">{savajcapitalbranch.savajcapitalbranch_name}</Td>
                  <Td>{savajcapitalbranch.city}</Td>
                  <Td>{savajcapitalbranch.state}</Td>
                  <Td>
                    {savajcapitalbranch.users
                      .map((user) => user.email)
                      .join(", ")}
                  </Td>
                  <Td>
                    <Button
                      onClick={() =>
                        navigateToEditPage(savajcapitalbranch.savajcapitalbranch_id)
                      }
                      variant="ghost"
                    >
                      <EditIcon color="blue.500" />
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default SavajCapitalBranchTable;
