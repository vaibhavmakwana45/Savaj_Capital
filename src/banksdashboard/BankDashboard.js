import {
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import IconBox from "components/Icons/IconBox";
import Loader from "react-js-loader";
import { DocumentIcon } from "components/Icons/Icons.js";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import { jwtDecode } from "jwt-decode";

export default function BankDashboard() {
  const history = useHistory();
  const iconBlue = useColorModeValue("#b19552", "#b19552");
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const tableRowColor = useColorModeValue("#F7FAFC", "navy.900");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textTableColor = useColorModeValue("gray.500", "white");
  const { colorMode } = useColorMode();
  const [apiData, setApiData] = useState({});
  const [totalAmounts, setTotalAmounts] = useState({});
  const [accessType, setAccessType] = useState("");
  React.useEffect(() => {
    const jwt = jwtDecode(localStorage.getItem("authToken"));
    setAccessType(jwt._id);
  }, []);

  const fetchData = async () => {
    try {
      if (!accessType.state || !accessType.city) {
        console.error("State or city is missing.");
        return;
      }

      const response = await AxiosInstance.get(
        `/allcount/loan-files-bankbranch/${accessType.state}/${accessType.city}/${accessType.bankuser_id}`
      );
      setApiData(response.data);

      const totalAmountPromises = response.data.map(async (loan) => {
        const { loan_id, loantype_id } = loan;

        const response = await AxiosInstance.get(
          `/file_upload/bankamounts/${loan_id}/${loantype_id || "none"}/${
            accessType.state
          }/${accessType.city}`
        );

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
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, [accessType]);

  return (
    <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
      {apiData && apiData.length > 0 ? (
        <SimpleGrid
          columns={{ base: 1, sm: 1, md: 2, xl: 4 }}
          spacing="24px"
          mb="20px"
        >
          {apiData.map((loan) => (
            <Card
              key={loan.loan_id}
              minH="125px"
              style={{
                cursor: "pointer",
                border: "1px solid #b19552",
                background: "#d4c6a5",
              }}
              onClick={() =>
                history.push(`/savajcapitaluser/userfile`, {
                  state: {
                    loan: loan.loan,
                    loan_id: loan.loan_id,
                    loantype_id: loan.loantype_id,
                  },
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
                     
                      fontWeight="bold"
                      textTransform="uppercase"
                    >
                      {loan.loanType !== "Unknown"
                        ? `${loan.loan} (${loan.loanType})`
                        : loan.loan}
                    </StatLabel>
                    <Flex>
                      <StatNumber
                        fontSize="lg"
                    
                        fontWeight="bold"
                        style={{ paddingTop: "10px", paddingBottom: "10px" }}
                      >
                        {loan.fileCount} files
                      </StatNumber>
                    </Flex>
                    <Text as="span" color="green.400" fontWeight="bold">
                      ₹
                      {totalAmounts[loan.loan_id]?.[
                        loan.loantype_id || "none"
                      ] || 0}
                    </Text>
                  </Stat>
                  <IconBox
                    borderRadius="50%"
                    as="box"
                    h={"45px"}
                    w={"45px"}
                    bg={"#212529"}
                  >
                    <DocumentIcon h={"24px"} w={"24px"} color={iconBoxInside} />
                  </IconBox>
                </Flex>

                {/* Display counts for all statuses */}
                <Flex mt="1px" wrap="wrap">
                  {Object.entries(loan.statusCounts)
                    .filter(([_, { count }]) => count > 0)
                    .map(([status, { count, color }]) => (
                      <Flex
                        key={status}
                        direction="column"
                        align="center"
                        mr="5px"
                      >
                        <Text fontSize="sm" fontWeight="bold" color={color}>
                          {status}
                        </Text>
                        <Text fontSize="md">
                          {count}
                        </Text>
                      </Flex>
                    ))}
                </Flex>
              </Flex>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Flex justify="center" align="center" height="200px">
          <Loader
            type="spinner-circle"
            bgColor={"#b19552"}
            color={"black"}
            size={50}
          />
        </Flex>
      )}
    </Flex>
  );
}
