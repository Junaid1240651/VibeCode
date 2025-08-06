import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Form , FormField} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import TextareaAutosize from "react-textarea-autosize";

interface  Props {
    projectId: string;
}

const formSchema = z.object({
    value: z.string().min(1, { message: "Prompt is required" })
        .max(10000, { message: "Prompt is too long" }),
    projectId: z.string().min(1, { message: "Project ID is required" })
})

export const MessageForm = ({ projectId }: Props) => {
    const trpc = useTRPC();
    const queryclient = useQueryClient()
    const createMessage = useMutation(trpc.messages.create.mutationOptions({
        onSuccess: () => {
            form.reset();
            queryclient.invalidateQueries(
                trpc.messages.getMany.queryOptions({ projectId })
            );
        },
        onError: (error) => {
            toast.error(error.message);
        }
    }))

    const [isFocused, setIsFocused] = useState(false);
    const isPending = createMessage.isPending;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            value: "",
            projectId: projectId
        }
    });
    const isBtnDisabled = isPending || !form.formState.isValid;
    const showUsage = false
    
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await createMessage.mutateAsync({
            value: values.value,
            projectId
        });
    }
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit((onSubmit))}
                className={cn(
                    'relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all',
                    isFocused && 'shadow-xs',
                    showUsage && 'rounded-t-none'
                )}
            >
                <FormField
                    control={form.control}
                    name="value"
                    render={({ field }) => (
                        <TextareaAutosize
                            {...field}
                            disabled={isPending}
                            className="pt-4 resize-none border-none w-full outline-none bg-transparent"
                            placeholder="What would you like to build?"
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            minRows={2}
                            maxRows={8}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && (!e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    form.handleSubmit(onSubmit)();
                                }
                            }}
                        />
                    )}
                />
                <div className="flex gap-x-2 items-end justify-between pt-2">
                    <div className="text-[10px] text-muted-foreground font-mono">
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                            <span>&#8984;</span>Enter
                        </kbd>
                        &nbsp;to submit
                    </div>
                    <Button className={
                        cn(
                            "size-8 rounded-full",
                            isBtnDisabled && 'bg-muted-foreground border'
                        )
                    }
                        disabled={isBtnDisabled}
                    >
                        {isPending ? (
                            <Loader2Icon className="size-4 animate-spin" />
                        ) : (
                            <ArrowUpIcon />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};