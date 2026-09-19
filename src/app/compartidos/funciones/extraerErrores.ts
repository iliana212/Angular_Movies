export function extraerErrores(obj: any): string[]{
    const err = obj.error.errors;
    let mensajeError: string[] = [];

    for(let llave in err){
        let campo = llave;
        const mensajesConCampos = err[llave].map((mensaje: string) => `${campo}: ${mensaje}`);
        mensajeError = mensajeError.concat(mensajesConCampos);
    }

    return mensajeError;
}

export function extraerErroresIdentity(obj: any): string[]{
    let mensajeError: string[] = [];

    for(let i = 0; i < obj.error.length; i++){
        const elemento = obj.error[i];
        mensajeError.push(elemento.description);
    }

    return mensajeError;
}