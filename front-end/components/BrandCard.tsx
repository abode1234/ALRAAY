import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  logo: string;
}

interface BrandCardProps {
  brand: Brand;
}

export default function BrandCard({ brand }: BrandCardProps) {
  return (
    <Link href={`/brands/${brand.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center justify-center aspect-square">
        <div className="w-24 h-24 mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
          <img
            src={brand.logo}
            alt={brand.name}
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{brand.name}</h3>
      </div>
    </Link>
  );
}

