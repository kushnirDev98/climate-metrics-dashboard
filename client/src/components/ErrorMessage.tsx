interface ErrorMessage {
    message: string;
}

export const ErrorMessage = ({ message }: ErrorMessage) => {
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <span className="block sm:inline">{message}</span>
        </div>
    );
};
