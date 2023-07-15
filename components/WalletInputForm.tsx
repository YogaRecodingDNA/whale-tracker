import { useState, ChangeEvent, FormEvent } from "react";
import { createStyles, TextInput, Button, Container } from "@mantine/core";
import { ethers } from "ethers";
import { useForm } from "@mantine/form";
import axios from "axios";

const useStyles = createStyles((theme) => ({
    input: {
        marginTop: theme.spacing.md,
        marginBottom: "1.5rem",
    },
    error: {
        color: theme.colors.red[7],
    }
}));

interface FormProps {
    onSubmit: (address: string) => void;
}

export default function WalletInputForm({ onSubmit }: FormProps) {
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');

    const form = useForm({
        initialValues: {
            address: "",
        },
        validate: {
            address: (value) => ethers.isAddress(value) ? null : "Invalid Ethereum address",
        },
    });

    const { errors, reset, isValid, setValues } = form;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!address) {
            setError('Please enter an Ethereum address');
            return;
        }

        if (!isValid()) {
            setError(errors.address?.toString() || 'Invalid Ethereum address.');
            return;
        }

        try {
            const response = await axios.get(
                '/api/get-contract-for-owner',
                {
                    params: { owner: address },
                }
            );
            const data = response.data;

            if (data.error) {
                setError(data.error);
            } else {
                onSubmit(address)
                reset();
                setError('');
            }
        } catch (err) {
            setError('An error occurred.');
        }
    };

    const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
        setAddress(e.target.value);
        setError('');
        setValues({ address: e.target.value });
    };

    const { classes } = useStyles();

    return (
        <Container>
            <form onSubmit={handleSubmit}>
                {error && <div className={classes.error}>{error}</div>}
                <TextInput
                    value={address}
                    onChange={handleAddressChange}
                    placeholder="Enter Ethereum address"
                    className={classes.input}
                />
                <Button type="submit" variant="outline" fullWidth>
                    Submit
                </Button>
            </form>
        </Container>
    );
};