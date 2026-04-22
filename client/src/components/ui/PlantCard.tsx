import z from "zod";
import type { plantSchema } from "@/types/plant.schema";
import type React from "react";
import { LightBadge } from "./LightBadge";
import { BASE_URL } from "@/utils/helper";

type Plant = z.infer<typeof plantSchema>

// Add 'target_moisture' to the types
type PlantCardProps = Pick<Plant, "name" | "current_moisture" | "target_moisture" | "light_need" | "owner_name" | "image_url"> & {
    onClick?: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
    name,
    current_moisture,
    target_moisture, // Extract this new prop
    light_need,
    owner_name,
    image_url,
    onClick
}) => {
 
    // Default to 50% if the plant doesn't have a specific target set
    const target = target_moisture || 50; 
    
    return (
        <article 
            onClick={onClick}
            className="flex flex-col justify-between bg-white border border-slate-300 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full"
        >
            <div>
                {/* Image / Placeholder */}
                <div className="relative w-full h-40 bg-slate-200">
                    {image_url ? (
                        <img
                        src={`${BASE_URL}${image_url}`}
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                            🌱
                        </div>
                    )}

                    {light_need && (
                        <div  className="absolute top-3 right-3">
                            <LightBadge level={light_need}/>
                        </div>
                    )}
                </div>
                
                {/* Content */}
                <div className="mb-4 pt-3">
                    <h3 className="text-2xl text-black font-bold mt-1 px-4 truncate"> 
                        {name}
                    </h3>
                    
                    {owner_name &&
                        <p className="text-sm text-gray-400 px-4 truncate mt-1">
                            👨🏻‍💻 Added by {owner_name} 
                        </p>
                    }
                </div>
            </div>

            {/* NEW: Moisture Section matching the modal's style */}
            {current_moisture !== undefined &&
                <div className="mx-3 mb-3 bg-slate-50 border border-slate-100 rounded-xl p-3 mt-auto">
                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5 flex items-center gap-1">
                                <span className="text-blue-500 text-sm">💧</span> Current
                            </p>
                            <p className="font-bold text-xl text-blue-600">
                                {current_moisture}%
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
                                Target
                            </p>
                            <p className="font-bold text-sm text-green-600">
                                {target}%
                            </p>
                        </div>
                    </div>

                    {/* Visual Progress/Target Bar */}
                    <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden relative mt-1">
                        {/* Target Marker Indicator */}
                        <div 
                            className="absolute top-0 bottom-0 w-1 bg-green-500 z-10" 
                            style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
                        />
                        
                        {/* Current Moisture Fill */}
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${current_moisture < target ? 'bg-orange-400' : 'bg-blue-500'}`}
                            style={{ width: `${current_moisture}%` }}
                        />
                    </div>
                    
                    {/* Warning text if plant needs water */}
                    {current_moisture < target && (
                        <p className="text-[10px] text-orange-600 font-medium mt-2 text-center bg-orange-50 py-1 rounded">
                            ⚠️ Needs watering
                        </p>
                    )}
                </div>
            }
        </article>
    );
};