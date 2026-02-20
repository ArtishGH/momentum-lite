/**
 * GenericList - A generic component that renders a list of items.
 * Demonstrates: Generic component with constrained type parameter.
 */

type GenericListProps<T extends { id: string }> = {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
  className?: string
}

export function GenericList<T extends { id: string }>({
  items,
  renderItem,
  emptyMessage = 'No items found.',
  className,
}: GenericListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={item.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}
