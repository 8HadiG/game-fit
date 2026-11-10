export default function Card({ data }) {
    const { title, subtitle, image, description, tag, value, action } = data;
    return (
        <div className="max-w-sm rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-200">
            {image && <img src={image} alt={title} className="w-full h-40 object-cover" />}
            <div className="p-4 space-y-2">
                {tag && (
                    <span className="inline-block text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {tag}
                    </span>
                )}
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                {description && <p className="text-sm text-gray-700">{description}</p>}
                <div className="flex items-center justify-between pt-2">
                    {value != null && <span className="text-lg font-semibold text-gray-900">{value}</span>}
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                            {action.label}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
