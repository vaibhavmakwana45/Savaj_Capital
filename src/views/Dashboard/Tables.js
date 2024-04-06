// Add axios to your imports
import axios from 'axios';
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
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import Card from 'components/Card/Card.js';
import CardBody from 'components/Card/CardBody.js';
import CardHeader from 'components/Card/CardHeader.js';
import TablesTableRow from 'components/Tables/TablesTableRow';

function Tables() {
  const [banks, setBanks] = useState([]); // State to store fetched banks
  const textColor = useColorModeValue('gray.700', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const history = useHistory();

  useEffect(() => {
    // Fetch banks and their users on component mount
    const fetchBanks = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/addbankuser/banks');
        setBanks(response.data.data); // Update state with fetched banks
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };

    fetchBanks();
  }, []); // Empty dependency array means this effect runs once on mount

  const navigateToAnotherPage = () => {
    history.push('/superadmin/addbank');
  };

  return (
    <Flex direction="column" pt={{ base: '120px', md: '75px' }}>
      <Card overflowX={{ sm: 'scroll', xl: 'hidden' }} pb="0px">
        <CardHeader p="6px 0px 22px 0px">
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="xl" color={textColor} fontWeight="bold">
              Banks and Users
            </Text>
            <Button onClick={navigateToAnotherPage} colorScheme="blue">
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
                <Th borderColor={borderColor} color="gray.400">
                  City
                </Th>
                <Th borderColor={borderColor} color="gray.400">
                  State
                </Th>
                <Th borderColor={borderColor} color="gray.400">
                  Users
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {banks.map((bank) => (
                <Tr key={bank._id}>
                  <Td pl="0px">{bank.bank_name}</Td>
                  <Td>{bank.city}</Td>
                  <Td>{bank.state}</Td>
                  <Td>{bank.users.map(user => user.email).join(', ')}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default Tables;
