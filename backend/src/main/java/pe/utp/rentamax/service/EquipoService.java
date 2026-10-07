package pe.utp.rentamax.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import pe.utp.rentamax.dto.EquipoRequest;
import pe.utp.rentamax.dto.EquipoResponse;
import pe.utp.rentamax.model.Categoria;
import pe.utp.rentamax.model.Equipo;
import pe.utp.rentamax.repository.CategoriaRepository;
import pe.utp.rentamax.repository.EquipoRepository;

import java.util.List;

/** CAPA SERVICIO: reglas de negocio del inventario de equipos (CRUD sobre la tabla "equipo"). */
@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final CategoriaRepository categoriaRepository;

    public EquipoService(EquipoRepository equipoRepository, CategoriaRepository categoriaRepository) {
        this.equipoRepository = equipoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<EquipoResponse> listar(String estado) {
        List<Equipo> equipos = (estado == null || estado.isBlank())
                ? equipoRepository.findAllByOrderByCodigo()
                : equipoRepository.findByEstadoOrderByCodigo(estado);
        return equipos.stream().map(EquipoResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public EquipoResponse obtener(Integer id) {
        return EquipoResponse.desde(buscar(id));
    }

    @Transactional
    public EquipoResponse crear(EquipoRequest req) {
        String codigo = req.codigo().trim();
        if (equipoRepository.existsByCodigo(codigo)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un equipo con el codigo " + codigo);
        }
        Equipo e = new Equipo();
        aplicar(e, req);
        return EquipoResponse.desde(equipoRepository.save(e));
    }

    @Transactional
    public EquipoResponse actualizar(Integer id, EquipoRequest req) {
        Equipo e = buscar(id);
        if (equipoRepository.existsByCodigoAndIdNot(req.codigo().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe otro equipo con ese codigo");
        }
        aplicar(e, req);
        return EquipoResponse.desde(equipoRepository.save(e));
    }

    @Transactional
    public void eliminar(Integer id) {
        equipoRepository.delete(buscar(id));
    }

    private Equipo buscar(Integer id) {
        return equipoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Equipo no encontrado"));
    }

    private void aplicar(Equipo e, EquipoRequest req) {
        Categoria cat = categoriaRepository.findById(req.categoriaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "La categoria indicada no existe"));
        e.setCodigo(req.codigo().trim());
        e.setNombre(req.nombre().trim());
        e.setCategoria(cat);
        e.setEstado(req.estado());
        e.setStockDisponible(req.stockDisponible());
        e.setStockMinimo(req.stockMinimo());
    }
}
