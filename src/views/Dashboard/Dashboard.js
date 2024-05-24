// Chakra imports
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
// Custom components
import Card from "components/Card/Card.js";
import BarChart from "components/Charts/BarChart";
import LineChart from "components/Charts/LineChart";
import IconBox from "components/Icons/IconBox";
// Custom icons
import {
  CartIcon,
  DocumentIcon,
  GlobeIcon,
  WalletIcon,
} from "components/Icons/Icons.js";
import React, { useEffect, useState } from "react";
// Variables
import {
  barChartData,
  barChartOptions,
  lineChartData,
  lineChartOptions,
} from "variables/charts";
import { pageVisits, socialTraffic } from "variables/general";
import { useHistory, useLocation } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import { PersonIcon } from "components/Icons/Icons";

export default function Dashboard() {
  const history = useHistory();
  // Chakra Color Mode
  const iconBlue = useColorModeValue("#b19552", "#b19552");
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const tableRowColor = useColorModeValue("#F7FAFC", "navy.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textTableColor = useColorModeValue("gray.500", "white");

  const { colorMode } = useColorMode();
  const [apiData, setApiData] = useState({
    banks: 0,
    users: 0,
    savajcapitalbranch: 0,
    superadmin: 0,
    loans: [],
  });
  const [totalAmounts, setTotalAmounts] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all([
          AxiosInstance.get("/allcount/data-count"),
          AxiosInstance.get("/allcount/loan-files"),
        ]);

        setApiData((prev) => ({
          ...prev,
          ...responses[0].data,
          loans: responses[1].data,
        }));

        // Fetch total amounts for each loan and loan type
        const totalAmountPromises = responses[1].data.map(async (loan) => {
          const { loan_id, loantype_id } = loan;
          console.log(loan, "loan");
          const response = await AxiosInstance.get(
            `/file_upload/amounts/${loan_id}/${loantype_id || ""}`
          );
          console.log(
            `Total amount for loan_id ${loan_id} and loantype_id ${
              loantype_id || "none"
            }:`,
            response.data.totalAmount
          ); // Log API response
          return {
            loan_id,
            loantype_id,
            totalAmount: response.data.totalAmount,
          };
        });

        const totalAmountsData = await Promise.all(totalAmountPromises);
        const totalAmountsMap = totalAmountsData.reduce(
          (acc, { loan_id, loantype_id, totalAmount }) => {
            if (!acc[loan_id]) {
              acc[loan_id] = {};
            }
            acc[loan_id][loantype_id || "none"] = totalAmount;
            return acc;
          },
          {}
        );
        setTotalAmounts(totalAmountsMap);
        console.log("Total amounts map:", totalAmountsMap); // Log the total amounts map
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
      <SimpleGrid
        columns={{ base: 1, sm: 1, md: 2, xl: 4 }}
        spacing="24px"
        mb="20px"
      >
        <Card
          minH="125px"
          style={{ cursor: "pointer" }}
          onClick={() => history.push("/superadmin/bank")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="gray.400"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Bank
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {apiData.banks}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <WalletIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            {/* <Text color="gray.400" fontSize="sm">
              <Text as="span" color="green.400" fontWeight="bold">
                +3.48%{" "}
              </Text>
              Since last month
            </Text> */}
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{ cursor: "pointer" }}
          onClick={() => history.push("/superadmin/savajcapitalbranch")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="gray.400"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Branch (Savaj Capital)
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {apiData.savajcapitalbrnach}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <GlobeIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            {/* <Text color="gray.400" fontSize="sm">
              <Text as="span" color="green.400" fontWeight="bold">
                +5.2%{" "}
              </Text>
              Since last month
            </Text> */}
          </Flex>
        </Card>
        <Card
          minH="125px"
          style={{ cursor: "pointer" }}
          onClick={() => history.push("/superadmin/alluser")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="gray.400"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total User
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {apiData.users}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            {/* <Text color="gray.400" fontSize="sm">
              <Text as="span" color="red.500" fontWeight="bold">
                -2.82%{" "}
              </Text>
              Since last month
            </Text> */}
          </Flex>
        </Card>
        <Card minH="125px">
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="gray.400"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total SuperAdmin
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {apiData.superadmin}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            {/* <Text color="gray.400" fontSize="sm">
              <Text as="span" color="green.400" fontWeight="bold">
                +8.12%{" "}
              </Text>
              Since last month
            </Text> */}
          </Flex>
        </Card>

        <Card
          minH="125px"
          style={{ cursor: "pointer" }}
          onClick={() => history.push("/superadmin/savajuserroles")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="gray.400"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Role
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {apiData.role}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <PersonIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            {/* <Text color="gray.400" fontSize="sm">
              <Text as="span" color="red.500" fontWeight="bold">
                -2.82%{" "}
              </Text>
              Since last month
            </Text> */}
          </Flex>
        </Card>

        <Card
          minH="125px"
          style={{ cursor: "pointer" }}
          onClick={() => history.push("/superadmin/filetable")}
        >
          <Flex direction="column">
            <Flex
              flexDirection="row"
              align="center"
              justify="center"
              w="100%"
              mb="25px"
            >
              <Stat me="auto">
                <StatLabel
                  fontSize="xs"
                  color="gray.400"
                  fontWeight="bold"
                  textTransform="uppercase"
                >
                  Total Files
                </StatLabel>
                <Flex>
                  <StatNumber
                    fontSize="lg"
                    color={textColor}
                    fontWeight="bold"
                    style={{ paddingTop: "10px" }}
                  >
                    {apiData.files}
                  </StatNumber>
                </Flex>
              </Stat>
              <IconBox
                borderRadius="50%"
                as="box"
                h={"45px"}
                w={"45px"}
                bg={"#b19552"}
              >
                <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
              </IconBox>
            </Flex>
            {/* <Text color="gray.400" fontSize="sm">
              <Text as="span" color="red.500" fontWeight="bold">
                -2.82%{" "}
              </Text>
              Since last month
            </Text> */}
          </Flex>
        </Card>
        {apiData.loans.map((loan) => (
          <Card
            key={loan.loan_id}
            minH="125px"
            style={{ cursor: "pointer" }}
            onClick={() =>
              history.push(`/superadmin/filetable`, {
                state: { loan: loan.loan, loan_id: loan.loan_id },
              })
            }
          >
            <Flex direction="column">
              <Flex
                flexDirection="row"
                align="center"
                justify="center"
                w="100%"
                mb="25px"
              >
                <Stat me="auto">
                  <StatLabel
                    fontSize="xs"
                    color="gray.400"
                    fontWeight="bold"
                    textTransform="uppercase"
                  >
                    {/* Check if loanType is not 'Unknown' to determine subtype */}
                    {loan.loanType !== "Unknown"
                      ? `${loan.loan} (${loan.loanType})`
                      : loan.loan}
                  </StatLabel>
                  <Flex>
                    <StatNumber
                      fontSize="lg"
                      color={textColor}
                      fontWeight="bold"
                      style={{ paddingTop: "10px", paddingBottom: "10px" }}
                    >
                      {loan.fileCount}
                    </StatNumber>
                  </Flex>
                  <Text as="span" color="green.400" fontWeight="bold">
                    ₹
                    {totalAmounts[loan.loan_id]?.[loan.loantype_id || "none"] ||
                      0}
                  </Text>
                </Stat>
                <IconBox
                  borderRadius="50%"
                  as="box"
                  h={"45px"}
                  w={"45px"}
                  bg={iconBlue}
                >
                  <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
                </IconBox>
              </Flex>
            </Flex>
          </Card>
        ))}
      </SimpleGrid>
    </Flex>
  );
}
