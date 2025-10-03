import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Image,
  Button,
  Chip,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";

export default function CakeCard({ cake, shopId }) {
  const navigate = useNavigate();

  return (
    <Card className="w-full hover:scale-105 transition-transform">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <h4 className="font-bold text-large">{cake.name}</h4>
        <small className="text-default-500">{cake.description}</small>
      </CardHeader>
      <CardBody className="overflow-visible py-2">
        <Image
          alt={cake.name}
          className="object-cover rounded-xl w-full h-[240px]"
          src={
            cake.imageUrl ||
            "https://via.placeholder.com/300x240?text=Delicious+Cake"
          }
        />
      </CardBody>
      <CardFooter className="flex justify-between items-center">
        <Chip color="success" variant="flat" size="lg">
          ₱{cake.basePrice}
        </Chip>
        <Button
          color="secondary"
          variant="shadow"
          size="sm"
          onClick={() => navigate(`/shop/${shopId}/customize/${cake.id}`)}
        >
          Customize
        </Button>
      </CardFooter>
    </Card>
  );
}
