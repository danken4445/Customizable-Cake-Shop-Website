import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function ShopCard({ shop }) {
  const navigate = useNavigate();

  return (
    <Card
      className="w-full hover:scale-105 transition-transform cursor-pointer"
      isPressable
    >
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <div className="flex items-center gap-2 mb-2">
          <Image
            src={shop.logoUrl || "https://via.placeholder.com/50"}
            alt={shop.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <h4 className="font-bold text-large">{shop.name}</h4>
        </div>
        <small className="text-default-500">{shop.description}</small>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt={shop.name}
          className="object-cover rounded-xl w-full h-[200px]"
          src={
            shop.coverImageUrl ||
            "https://via.placeholder.com/400x200?text=Cake+Shop"
          }
        />
      </CardBody>
      <CardFooter>
        <Button
          color="primary"
          variant="shadow"
          className="w-full"
          onClick={() => navigate(`/shop/${shop.id}`)}
        >
          View Cakes
        </Button>
      </CardFooter>
    </Card>
  );
}
