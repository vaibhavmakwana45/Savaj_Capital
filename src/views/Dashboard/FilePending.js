import {
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import Card from "components/Card/Card.js";
import IconBox from "components/Icons/IconBox";
import { DocumentIcon } from "components/Icons/Icons.js";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import AxiosInstance from "config/AxiosInstance";
import Loader from "react-js-loader"; // Ensure this import is correct

export default function FilePending() {
  const history = useHistory();
  const iconBoxInside = useColorModeValue("white", "white");
  const textColor = useColorModeValue("gray.700", "white");
  const [loadingLoans, setLoadingLoans] = useState(true);
  const [fileCount, setfileCount] = useState([]);

  useEffect(() => {
    const fetchDataCount = async () => {
      try {
        const response = await AxiosInstance.get(
          "/allcount/files-within-date-range"
        );
        setfileCount(response.data);
      } catch (error) {
        console.error("Failed to fetch data count:", error);
      } finally {
        setLoadingLoans(false); // Ensure loading state is updated
      }
    };

    fetchDataCount();
  }, []);

  const getColor = (daysLeft) => {
    if (daysLeft <= 5) {
      return "red";
    } else if (daysLeft <= 10) {
      return "orange";
    } else {
      return "green";
    }
  };

  const calculateDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      {loadingLoans ? (
        <Flex
          justify="center"
          align="center"
          height="100vh" // Ensure full viewport height
          width="100%" // Ensure full viewport width
          position="fixed" // Ensures it overlays everything
          top="0"
          left="0"
        >
          <Loader
            type="spinner-circle"
            bgColor={"#b19552"}
            color={"black"}
            size={50}
          />
        </Flex>
      ) : (
        <Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
          <SimpleGrid
            columns={{ base: 1, sm: 1, md: 2, xl: 4 }}
            spacing="24px"
            mb="20px"
          >
            {fileCount.map((file, index) => {
              const daysLeft = calculateDaysLeft(file.end_date);
              const color = getColor(daysLeft);
              const bgColor =
                color === "red"
                  ? "#FFCCCC"
                  : color === "orange"
                  ? "#FFE5CC"
                  : "#CCFFCC";

              return (
                <Card
                  key={index}
                  minH="125px"
                  style={{
                    cursor: "pointer",
                    border: `1px solid ${color}`,
                    backgroundColor: bgColor,
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.3s, box-shadow 0.3s",
                  }}
                  _hover={{
                    transform: "scale(1.05)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                  }}
                  onClick={() =>
                    history.push(`/superadmin/viewfile?id=${file.file_id}`)
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
                          fontSize="sm"
                          color="#212529"
                          fontWeight="bold"
                          textTransform="uppercase"
                        >
                          {`${file.loan.loan} ${
                            file.loantype ? `(${file.loantype.loan_type})` : ""
                          }`}
                        </StatLabel>
                        <Flex>
                          <StatNumber
                            fontSize="sm"
                            color={textColor}
                            fontWeight="bold"
                            pt="10px"
                          >
                            {`${file.user.username} ${
                              file.user.businessname
                                ? `(${file.user.businessname})`
                                : ""
                            }`}
                          </StatNumber>
                        </Flex>
                        <Flex>
                          <StatNumber
                            fontSize="lg"
                            color={textColor}
                            fontWeight="bold"
                            pt="10px"
                          >
                            {file.filename}
                          </StatNumber>
                        </Flex>
                        <Text color={color} fontSize="sm">
                          Days left: {daysLeft}
                        </Text>
                      </Stat>
                      <IconBox
                        borderRadius="50%"
                        as="box"
                        h={"45px"}
                        w={"45px"}
                        bg={"#212529"}
                      >
                        <DocumentIcon
                          h={"24px"}
                          w={"24px"}
                          color={iconBoxInside}
                        />
                      </IconBox>
                    </Flex>
                  </Flex>
                </Card>
              );
            })}
          </SimpleGrid>
        </Flex>
      )}
    </>
  );
}
