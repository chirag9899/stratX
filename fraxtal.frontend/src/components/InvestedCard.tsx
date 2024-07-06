import React from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";

interface SimpleCardProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}

const InvestedCard: React.FC<SimpleCardProps> = ({
  title,
  investedAmount,
  onButtonClick,
}) => {
  return (
    <Card className="mt-6 w-96 bg-stratx-card-bg text-white shadow-xl">
      <CardBody>
        <Typography variant="h5" className="mb-2 text-white font-poppins capitalize">
          {title}
        </Typography>
        <Typography>
          <span className="font-bold text-stratx-accent-blue">
          Invested Amount :   
            </span>{investedAmount}</Typography>
      </CardBody>
      <CardFooter className="pt-0">
        <div className="flex justify-end w-full">

        <Button
          onClick={onButtonClick}
          size="sm"
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 border border-stratx-accent-blue/50 text-white"
        >
          explore
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
            />
          </svg>
        </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InvestedCard;
