export default class fenHandler {
    // return positions only
    removeExtraInfo = (fen: string): string => (fen.indexOf(' ') > -1 ? fen.substring(0, fen.indexOf(' ')) : fen);
    
    // expand numbers of empty fields
    expandNumbers = (fen: string): string => fen.replace(/(\d)/g, (_, p) => '1'.repeat(p));
    
    // compress numbers of empty fields
    compressNumbers = (fen: string): string => fen.replace(/([1|.]+)/g, (c, p) => p.length.toString());
    
    // return rows as arrays
    getFenParts = (fen: string): string[] => this.expandNumbers(this.removeExtraInfo(fen)).split('/');

    // decode position (eg a1) to indexes
    decodePosition = (pos: string): [number, number] => [pos.charCodeAt(0) - 97, Math.abs(parseInt(pos.charAt(1), 10) - 1 - 7)]

    // set piece at position
    setPiece = (fenParts: string[], position: string, piece?: string): string[] => {
        var pos = this.decodePosition(position);

        fenParts[pos[1]] = fenParts[pos[1]].replace(/./g, (c, i) => ((i === pos[0]) ? (piece ? piece : '1') : c));

        return fenParts;
    }

    // move piece to new position
    move(fen: string, piece: string, from?: string, to?: string) {
        var fenParts = this.getFenParts(this.expandNumbers(this.removeExtraInfo(fen)));
        
        if (from) {
            fenParts = this.setPiece(fenParts, from);
        }

        if (to) {
            fenParts = this.setPiece(fenParts, to, piece);
        }

        return this.compressNumbers(fenParts.join('/'));
    }
}