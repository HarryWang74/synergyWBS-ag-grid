export interface TableStatus {
    columnOrder: string[]
    columnVisibility: {
        [key: string]: boolean
    }
    columnSizing: {
        [key: string]: number
    }
    columnPinning: {
        left: string[]
        right: string[]
    }
    rowSelection: {
        [key: string]: boolean
    }
    expanded: {
        [key: string]: boolean
    }
}
