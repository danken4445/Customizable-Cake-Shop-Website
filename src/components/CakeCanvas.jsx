import { useDrop } from "react-dnd";
import { Image, Button, Chip } from "@nextui-org/react";

export default function CakeCanvas({
  cakeImage,
  onToppingAdd,
  placedToppings,
  onToppingRemove,
}) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "topping",
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const dropArea = document.getElementById("cake-canvas");
      const rect = dropArea.getBoundingClientRect();

      // Calculate relative position
      const x = ((offset.x - rect.left) / rect.width) * 100;
      const y = ((offset.y - rect.top) / rect.height) * 100;

      onToppingAdd({ ...item, x, y, id: Date.now() });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  return (
    <div className="relative">
      <div
        id="cake-canvas"
        ref={drop}
        className={`relative w-full h-[400px] border-4 border-dashed rounded-xl overflow-hidden transition-colors ${
          isOver ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
        }`}
      >
        <Image
          src={cakeImage}
          alt="Cake Base"
          className="w-full h-full object-contain"
        />

        {/* Render placed toppings */}
        {placedToppings.map((topping) => (
          <div
            key={topping.id}
            className="absolute cursor-pointer group"
            style={{
              left: `${topping.x}%`,
              top: `${topping.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => onToppingRemove(topping.id)}
          >
            <Image
              src={topping.imageUrl}
              alt={topping.name}
              className="w-12 h-12 object-contain"
            />
            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Chip color="danger" size="sm" variant="flat">
                ✕
              </Chip>
            </div>
          </div>
        ))}
      </div>

      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl pointer-events-none">
          <p className="text-2xl font-bold text-green-600">
            Drop topping here!
          </p>
        </div>
      )}
    </div>
  );
}
