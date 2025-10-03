import { useDrag } from "react-dnd";
import { Image } from "@nextui-org/react";

export default function ToppingItem({ topping }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "topping",
    item: { ...topping },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`flex flex-col items-center p-2 bg-white rounded-lg shadow-md cursor-move hover:shadow-lg transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <Image
        src={topping.imageUrl}
        alt={topping.name}
        className="w-16 h-16 object-contain"
      />
      <p className="text-xs mt-1 text-center font-semibold">{topping.name}</p>
      <p className="text-xs text-green-600">+₱{topping.price}</p>
    </div>
  );
}
