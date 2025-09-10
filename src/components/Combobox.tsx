import { ChevronsUpDownIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Popover, PopoverTrigger } from './ui/popover'

interface ComboboxProps {
    label?: string
}

const Combobox = ({ label }: ComboboxProps) => {
    return (
        <div>
            <p className='text-sm font-medium mb-2 text-neutral-700'>{label}</p>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        className="w-[200px] justify-between font-normal rounded-sm"
                    >
                        Todas
                        <ChevronsUpDownIcon />
                    </Button>
                </PopoverTrigger>
            </Popover>
        </div>
    )
}

export default Combobox